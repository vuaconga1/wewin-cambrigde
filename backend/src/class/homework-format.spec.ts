import { formatVnDateTime, toCsv } from './homework-format';

describe('formatVnDateTime', () => {
  it('hiển thị theo giờ Việt Nam', () => {
    expect(formatVnDateTime(new Date('2026-11-05T10:00:00Z'))).toBe(
      '05/11/2026 17:00',
    );
  });
});

describe('toCsv', () => {
  it('có BOM, escape dấu phẩy / ngoặc kép và chống chèn công thức', () => {
    const csv = toCsv([
      ['Mã HV', 'Họ tên'],
      ['=1+1', 'Nguyễn "A", B'],
    ]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toBe('\uFEFFMã HV,Họ tên\r\n\'=1+1,"Nguyễn ""A"", B"');
  });
});
