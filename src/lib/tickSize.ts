/**
 * 한국 주식 호가 단위 기준 (KRX)
 * 입력된 가격을 호가 단위에 맞게 내림 보정합니다.
 */
export function adjustToTickSize(price: number): number {
  if (price < 2000) return Math.floor(price / 1) * 1;
  if (price < 5000) return Math.floor(price / 5) * 5;
  if (price < 10000) return Math.floor(price / 10) * 10;
  if (price < 50000) return Math.floor(price / 50) * 50;
  if (price < 100000) return Math.floor(price / 100) * 100;
  if (price < 500000) return Math.floor(price / 500) * 500;
  return Math.floor(price / 1000) * 1000;
}

export function getTickSize(price: number): number {
  if (price < 2000) return 1;
  if (price < 5000) return 5;
  if (price < 10000) return 10;
  if (price < 50000) return 50;
  if (price < 100000) return 100;
  if (price < 500000) return 500;
  return 1000;
}
