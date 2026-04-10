export interface ButtonProps {
  label: string;
  onClick: () => void; // 매개변수 없고 리턴 없는 함수 타입
  name? : string;
}
