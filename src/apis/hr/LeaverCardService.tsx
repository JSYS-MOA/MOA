import axios from "axios";
import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";
import {
    deleteHrCardApi,
    getHrCardInfoApi,
    getHrCardListApi,
    type HrCard,
    type HrCardRequest,
    type HrCardUpdateRequest,
    updateHrCardApi,
} from "./HrCardService";

export type LeaverCard = HrCard;
export type LeaverCardRequest = HrCardRequest;
export type LeaverCardUpdateRequest = HrCardUpdateRequest;
export type LeaverCardAddRequest = {
    userId: number;
    quitDate: string;
};

const LEAVER_API = "http://localhost/api/hr/leavers";

const isLeaverCard = (card: HrCard) => Boolean(card.quitDate?.trim());

const ensureLeaverCard = (card: HrCard) => {
    if (!isLeaverCard(card)) {
        throw new Error("퇴사자 카드 정보를 찾을 수 없습니다.");
    }

    return card;
};

const invalidateLeaverCardQueries = (queryClient: QueryClient, userId?: number) => {
    queryClient.invalidateQueries({ queryKey: ["leaverCardList"] });
    queryClient.invalidateQueries({ queryKey: ["LeaverCardList"] });
    queryClient.invalidateQueries({ queryKey: ["hrCardList"] });

    if (userId) {
        queryClient.invalidateQueries({ queryKey: ["leaverCardInfo", userId] });
        queryClient.invalidateQueries({ queryKey: ["LeaverCardInfo", userId] });
        queryClient.invalidateQueries({ queryKey: ["hrCardInfo", userId] });
    }
};

export async function getLeaverCardListApi() {
    const cards = await getHrCardListApi();
    return cards.filter(isLeaverCard);
}

export async function getLeaverCardInfoApi(userId: number) {
    const card = await getHrCardInfoApi(userId);
    return ensureLeaverCard(card);
}

export async function addLeaverCardApi(request: LeaverCardAddRequest) {
    const userId = request.userId;
    const quitDate = request.quitDate?.trim();

    if (!userId) {
        throw new Error("퇴사 처리할 직원을 선택해 주세요.");
    }

    if (!quitDate) {
        throw new Error("퇴사일을 입력해 주세요.");
    }

    await axios.post(
        `${LEAVER_API}/add`,
        {
            userId,
            quitDate,
        },
        {
            withCredentials: true,
        }
    );

    return getLeaverCardInfoApi(userId);
}

export async function updateLeaverCardApi(
    userId: number,
    request: LeaverCardUpdateRequest
) {
    const card = await updateHrCardApi(userId, request);
    return ensureLeaverCard(card);
}

export async function deleteLeaverCardApi(userId: number) {
    return deleteHrCardApi(userId);
}

export function useLeaverCardList() {
    return useQuery<LeaverCard[]>({
        queryKey: ["leaverCardList"],
        queryFn: getLeaverCardListApi,
    });
}

export function useLeaverCardInfo(userId: number) {
    return useQuery<LeaverCard>({
        queryKey: ["leaverCardInfo", userId],
        queryFn: () => getLeaverCardInfoApi(userId),
        enabled: !!userId,
    });
}

export function useLeaverCardAdd() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: LeaverCardAddRequest) => addLeaverCardApi(request),
        onSuccess: (card) => {
            invalidateLeaverCardQueries(queryClient, card.userId);
        },
    });
}

export function useLeaverCardUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            request,
        }: {
            userId: number;
            request: LeaverCardUpdateRequest;
        }) => updateLeaverCardApi(userId, request),
        onSuccess: (_, variables) => {
            invalidateLeaverCardQueries(queryClient, variables.userId);
        },
    });
}

export function useLeaverCardDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => deleteLeaverCardApi(userId),
        onSuccess: (_, userId) => {
            invalidateLeaverCardQueries(queryClient, userId);
        },
    });
}
