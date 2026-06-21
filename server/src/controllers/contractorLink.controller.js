import { getContractorsByLandlord, getLandlordsByContractor, revokeLink } from '../services/contractorLink.service.js';

const listContractors = async (req, res, next) => {
  try {
    const links = await getContractorsByLandlord(req.user.id);

    return res.status(200).json({ data: links });
  } catch (error) {
    return next(error);
  }
};

const listLandlords = async (req, res, next) => {
  try {
    const links = await getLandlordsByContractor(req.user.id);

    return res.status(200).json({ data: links });
  } catch (error) {
    return next(error);
  }
};

const revoke = async (req, res, next) => {
  try {
    await revokeLink(req.params.linkId, req.user.id);

    return res.status(200).json({ message: 'Link revoked successfully' });
  } catch (error) {
    return next(error);
  }
};

export { listContractors, listLandlords, revoke };
