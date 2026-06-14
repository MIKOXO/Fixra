import { generateToken } from '../services/inviteToken.service.js';

const createInvite = async (req, res, next) => {
  try {
    const { role, email, meta } = req.body;

    const enrichedMeta = {
      ...meta,
      ...(req.user.role === 'LANDLORD' ? { landlordId: req.user.id } : {}),
      ...(req.user.role === 'CONTRACTOR' ? { contractorId: req.user.id } : {}),
    };

    const rawToken = await generateToken({
      role,
      invitedBy: req.user.id,
      email,
      meta: enrichedMeta,
    });

    return res.status(201).json({
      message: 'Invite token generated successfully',
      token: rawToken,
    });
  } catch (error) {
    return next(error);
  }
};

export { createInvite };
