//수정모달용
export interface Notice {
    noticeId: number;
    noticeTitle: string;
    noticeContent: string | null;
    noticeType: string | null;
    isNotice: boolean | null;
    file: string | null;
}

export interface NoticeForm {
    title: string;
    content: string;
    noticeType: string;
    isNotice: boolean;
    file: File | null;
    existingFile: string | null;
}

export interface NoticeDetail {
    noticeId: number;
    noticeTitle: string;
    noticeContent: string;
    file: string;
    postDate: string;
    writerName: string;
    writerId: number;
}

//리스트용
export interface NoticeItem {
    noticeId: number;
    noticeTitle: string;
    file: string;
    postDate: string;
    writerName: string;
    isNotice: boolean;
}