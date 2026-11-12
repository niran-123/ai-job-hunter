import { Router } from 'express';
import { countryController } from './countryController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', countryController.getCountries);
router.put('/', authMiddleware, countryController.updateCountryPreference);

export default router;

