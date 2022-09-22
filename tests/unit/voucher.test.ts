import { jest } from "@jest/globals";
import voucherRepository from "../../src/repositories/voucherRepository"
import voucherService from "../../src/services/voucherService"

jest.mock("../../src/repositories/voucherRepository");

describe("voucherService test", () => {
    it("should create a new voucher", async () => {
        const code = "desconto";
        const amount = 200;

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
            return false;
         });

        await voucherService.createVoucher(code,amount);

        expect(voucherRepository.createVoucher).toBeCalled();
    });

    it("should fail to create a duplicate", () => {
        const code = "desconto";
        const amount = 200;

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
            return true;
         });

         const result = voucherService.createVoucher(code, amount);

         expect(result).rejects.toEqual({
            message: "Voucher already exist.",
            type: "conflict" 
        });
    });

    it("should fail to apply amount for unregistered voucher", () => {
        const code = "desconto";
        const amount = 200;

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
            return false;
         });

        const result = voucherService.applyVoucher(code,amount);

        expect(result).rejects.toEqual({
            message: 'Voucher does not exist.',
            type: 'conflict'
        });
    });

    it("should apply amount", async () => {
        const code = "desconto";
        const amount = 200;
        const discount = 20;

        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => { 
            return true;
        });
        
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
            return {
                id: 1,
                code,
                discount,
                used:false
            };
         });

         const apply = await voucherService.applyVoucher(code,amount);
         expect(apply.amount).toBe(amount);
         expect(apply.applied).toBe(true)
         expect(apply.discount).toBe(discount);
         expect(apply.finalAmount).toBe(amount - amount * (discount / 100));
    });

    it("should not apply discout for amount below 100", async () => {
        const code = "desconto";
        const amount = 80;
        const discount = 20;

        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => { 
            return true;
        });
        
        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
            return {
                id: 1,
                code,
                discount,
                used:false
            };
         });

         const apply = await voucherService.applyVoucher(code,amount);
         expect(apply.amount).toBe(amount);
         expect(apply.applied).toBe(false)
         expect(apply.discount).toBe(discount);
         expect(apply.finalAmount).toBe(amount);
    })
})