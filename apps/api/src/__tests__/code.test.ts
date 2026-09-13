import { e2bCodeService } from '../services/code/e2b.service';

describe('E2B Code Execution Service', () => {
  it('executes python code inside isolated sandbox mock', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('/sandboxes') && !url.includes('/commands')) {
        return {
          ok: true,
          json: async () => ({ sandboxID: 'sbx_test_123' }),
        } as any;
      }
      if (url.includes('/commands')) {
        return {
          ok: true,
          json: async () => ({
            stdout: 'Calculated torque: 4.5 Nm\n',
            stderr: '',
            exitCode: 0,
          }),
        } as any;
      }
      return { ok: true, json: async () => ({}) } as any;
    });

    try {
      jest.spyOn(e2bCodeService, 'isConfigured').mockReturnValue(true);

      const res = await e2bCodeService.execute({
        code: 'print("Calculated torque: 4.5 Nm")',
        language: 'python',
      });

      expect(res.stdout).toContain('Calculated torque: 4.5 Nm');
      expect(res.exitCode).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
