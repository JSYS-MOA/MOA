package com.moa.server.entity.user.service;

import com.moa.server.entity.user.AdminRoleRepository;
import com.moa.server.entity.user.DepartmentRepository;
import com.moa.server.entity.user.GradeRepository;
import com.moa.server.entity.user.UserEntity;
import com.moa.server.entity.user.UserRepository;
import com.moa.server.entity.user.dto.HrCardRequestPageDTO;
import com.moa.server.entity.user.dto.HrCardResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
public class HrCardService {
    private final UserRepository userRepository;

    private final AdminRoleRepository adminRoleRepository;
    private final DepartmentRepository departmentRepository;
    private final GradeRepository gradeRepository;

    public List<UserEntity> hrCardList() {
        return userRepository.findAll();
    }

    public List<HrCardResponseDTO> hrCardResponseList() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public HrCardRequestPageDTO<HrCardResponseDTO> hrCardPageList(int page, int size) {
        return toPageResponse(userRepository.findAll(createPageable(page, size)));
    }

    public List<UserEntity> hrCardSearch(String searchCondition, String searchKeyword) {
        if (searchCondition == null || searchCondition.isBlank()) {
            return userRepository.findAll();
        }

        String condition = searchCondition.trim().toLowerCase(Locale.ROOT);
        String keyword = searchKeyword == null ? "" : searchKeyword.trim();

        return switch (condition) {
            case "username", "user_name", "name" -> userRepository.findByUserNameContaining(keyword);
            case "employeeid", "employee_id" -> userRepository.findByEmployeeIdContaining(keyword);
            case "departmentid", "department_id" -> userRepository.findByDepartmentId(parseInteger(keyword));
            case "gradeid", "grade_id" -> userRepository.findByGradeId(parseInteger(keyword));
            case "bank" -> userRepository.findByBank(keyword);
            case "active" -> userRepository.findByQuitDateIsNull();
            case "retired", "quit" -> userRepository.findByQuitDateIsNotNull();
            default -> throw new IllegalArgumentException("지원하지 않는 검색 조건입니다. " + searchCondition);
        };
    }

    public List<HrCardResponseDTO> hrCardResponseSearch(String searchCondition, String searchKeyword) {
        return hrCardSearch(searchCondition, searchKeyword).stream()
                .map(this::toResponse)
                .toList();
    }

    public HrCardRequestPageDTO<HrCardResponseDTO> hrCardPageSearch(String searchCondition, String searchKeyword, int page, int size) {
        Pageable pageable = createPageable(page, size);

        if (searchCondition == null || searchCondition.isBlank()) {
            return toPageResponse(userRepository.findAll(pageable));
        }

        String condition = searchCondition.trim().toLowerCase(Locale.ROOT);
        String keyword = searchKeyword == null ? "" : searchKeyword.trim();

        Page<UserEntity> userPage = switch (condition) {
            case "username", "user_name", "name" -> userRepository.findByUserNameContaining(keyword, pageable);
            case "employeeid", "employee_id" -> userRepository.findByEmployeeIdContaining(keyword, pageable);
            case "departmentid", "department_id" -> userRepository.findByDepartmentId(parseInteger(keyword), pageable);
            case "gradeid", "grade_id" -> userRepository.findByGradeId(parseInteger(keyword), pageable);
            case "bank" -> userRepository.findByBank(keyword, pageable);
            case "active" -> userRepository.findByQuitDateIsNull(pageable);
            case "retired", "quit" -> userRepository.findByQuitDateIsNotNull(pageable);
            default -> throw new IllegalArgumentException("지원하지 않는 검색 조건입니다. " + searchCondition);
        };

        return toPageResponse(userPage);
    }

    public HrCardResponseDTO hrCardInfo(Integer userId) {
        return userRepository.findById(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    public UserEntity hrCardAdd(UserEntity user) {
        if (user.getStartDate() == null) {
            user.setStartDate(LocalDate.now());
        }

        return userRepository.save(user);
    }

    public HrCardResponseDTO hrCardRegisterLeaver(Integer userId, LocalDate quitDate) {
        if (userId == null) {
            throw new IllegalArgumentException("퇴사 처리할 직원을 선택해 주세요.");
        }

        if (quitDate == null) {
            throw new IllegalArgumentException("퇴사일을 입력해 주세요.");
        }

        UserEntity user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return null;
        }

        user.setQuitDate(quitDate);
        return toResponse(userRepository.save(user));
    }

    public UserEntity hrCardUpdate(Integer userId, UserEntity newUser) {
        UserEntity user = userRepository.findById(userId).orElse(null);

        if (user != null) {
            user.setUserName(newUser.getUserName());
            user.setEmployeeId(newUser.getEmployeeId());
            user.setPassword(newUser.getPassword());
            user.setRoleId(newUser.getRoleId());
            user.setPhone(newUser.getPhone());
            user.setEmail(newUser.getEmail());
            user.setAddress(newUser.getAddress());
            user.setStartDate(newUser.getStartDate());
            user.setQuitDate(newUser.getQuitDate());
            user.setDepartmentId(newUser.getDepartmentId());
            user.setGradeId(newUser.getGradeId());
            user.setBirth(newUser.getBirth());
            user.setPerformance(newUser.getPerformance());
            user.setProfileUrl(newUser.getProfileUrl());
            user.setBank(newUser.getBank());
            user.setAccountNum(newUser.getAccountNum());

            return userRepository.save(user);
        }

        return null;
    }

    public void hrCardDelete(Integer userId) {
        userRepository.deleteById(userId);
    }

    private Integer parseInteger(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("숫자 검색 조건에는 숫자 값을 입력해야 합니다.");
        }
    }

    private Pageable createPageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "userId"));
    }

    private HrCardRequestPageDTO<HrCardResponseDTO> toPageResponse(Page<UserEntity> userPage) {
        return HrCardRequestPageDTO.<HrCardResponseDTO>builder()
                .content(userPage.getContent().stream().map(this::toResponse).toList())
                .currentPage(userPage.getNumber())
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .pageSize(userPage.getSize())
                .build();
    }

    private HrCardResponseDTO toResponse(UserEntity user) {
        return HrCardResponseDTO.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .employeeId(user.getEmployeeId())
                .roleId(user.getRoleId())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(user.getAddress())
                .startDate(user.getStartDate())
                .quitDate(user.getQuitDate())
                .departmentId(user.getDepartmentId())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .gradeId(user.getGradeId())
                .gradeName(user.getGrade() != null ? user.getGrade().getGradeName() : null)
                .birth(user.getBirth())
                .performance(user.getPerformance())
                .profileUrl(user.getProfileUrl())
                .bank(user.getBank())
                .accountNum(user.getAccountNum())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
