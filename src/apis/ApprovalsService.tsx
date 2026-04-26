import { useQuery , useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/gw/";

// 내 결재내역 조회
  export function useGetApprovaUserList(  writer : number , search?: string , page? : number  ,  size? : number ) {
    return useQuery({
      queryKey: ["ApprovaUser",  writer ,search || '' , page , size ], 
      queryFn: async () => {
        const { data } = await axios.get(`${Api_BASE}approvals`, {   
          params: {
            writer : writer,
            page : page ,
            size : size ,
            search : search || ''
          }
        });
        return data;
      },
    });
  }

// 결재 상제정보 및 팀장 결제 내역 상세조회 
 export function useGetApprovaInfo () {
    return useMutation({
      mutationFn: async (  approvaId: number ) => {
        const { data } = await axios.get(`${Api_BASE}approvals/${approvaId}`, {   
        });
        return data;
      },
    });
  }

// 결재라인 선택
    // @GetMapping("/orders/select/approvaLine")
    // public Page<?> getApprovaLineList ( @PageableDefault(page = 0, size = 10 )Pageable pageable) {
    //     return approvalService.getApprovaLineCord( pageable);
    // }


// 결재 요청 post /api/gw/approvals
//  @PostMapping("/approvals")
//     public void postAddApprovals( @RequestBody ApprovaAddDTO dto) {
//         approvalService.insertApprovals(dto);
//     }



// 미결재 결재 삭제 DELETE /api/gw/approvals/{approva_id}
// @DeleteMapping("/approvals/{approvaId}")
//     public void postAddOrderForm( @PathVariable("approvaId") Integer approvaId ) {
//         approvalService.Deleteapprova(approvaId);
//     }


// 팀장 결제 내역 조회 GET /api/gw/approvalWait
// @GetMapping("/approvalWait")
//     public Page<ApprovaUserDTO> getApproverList(@Param("approver") Integer approver, @Param("search") String search, @PageableDefault(page = 0, size = 10 )Pageable pageable) {
//         return approvalService.getApproverList(approver, pageable);
//     }



// 팀장 결제 내역 반려 / 결재 처리 PATCH /api/gw/approvalAct/{approva_id}
  // @PatchMapping("/approvalAct/{approvaId}")
  //   public ResponseEntity<?> updateUserRole (@PathVariable("approvaId") Integer approvaId, @RequestParam("approvaStatus") String approvaStatus ) {
  //       int result = approvalService.updateApprovaStatus(approvaId , approvaStatus);
  //       return ResponseEntity.ok(result);
  //   }


// 팀원 조회  GET /api/gw/teamMembers
    // @GetMapping("/teamMembers")
    // public ResponseEntity<?> getTeamMembers( Integer departmentId ,@PageableDefault(page = 0, size = 10, sort = "UserId", direction = Sort.Direction.ASC) Pageable pageable,  @RequestParam(defaultValue = "") String search) {
    //     Page<TeamUserDTO> result = adminService.findByDepartmentIdAndUserNameContaining(departmentId, search, pageable);
    //     return ResponseEntity.ok(result);
    // }


// 팀원 상세 조회  GET /api/gw/teamMembers/{department_id} <= {user_id} 유저로 변경
// @GetMapping("/teamMembers/{userId}")
//     public ResponseEntity<?> getTeamMemberInfo ( @PathVariable("userId") Integer userId ) {
//         TeamUserDTO result = adminService.findTeamByUserId( userId );
//         return ResponseEntity.ok(result);
//     }


// 인사 평가 추가 PUT /api/gw/teamMembers/{user_id}
    // @PatchMapping("/teamMembers/{userId}")
    // public ResponseEntity<?> updateUserRole ( @PathVariable("userId") Integer userId, @RequestParam("performance") String performance ) {
    //     int result = adminService.updatePerformance(userId , performance);
    //     return ResponseEntity.ok(result);
    // }


// 결재 문서 양식 리스트 양식 추가 ,양식 삭제, 양식 수정 <= 윤아님이 만든 기본사항 > 그룹웨어 >  공통양식 리스트로 이동시키기