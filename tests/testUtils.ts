export function mockClassMethod(
  c: any,
  method: string
): {
  restore: () => void;
} {
  const originalMethod = c[method];

  c[method] = jest.fn();

  return {
    restore: () => {
      c[method] = originalMethod;
    }
  };
}
