import { validationResult } from "express-validator";
import { v4 as uuid } from "uuid";
import Payment from "../models/Payment.js";
import { recordAudit } from "../utils/audit.js";

export const createPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { applicationId, amount, gateway = "mock" } = req.body;
    const reference = `PAY-${uuid().slice(0, 8).toUpperCase()}`;

    const payment = await Payment.create({
      applicationId,
      amount,
      gateway,
      reference,
      status: "SUCCESS",
      paidAt: new Date(),
      metadata: { simulated: true },
    });

    await recordAudit({
      actor: req.user.id,
      action: "PAYMENT_RECORDED",
      context: { paymentId: payment._id.toString(), applicationId },
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ applicationId: req.params.applicationId }).sort({
      createdAt: -1,
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

