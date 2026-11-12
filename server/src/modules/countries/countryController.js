import { store } from '../../services/store.js';

export const countryController = {
  getCountries: (req, res) => {
    store.updateCountryJobCounts();
    return res.json({
      success: true,
      data: store.countries
    });
  },

  updateCountryPreference: (req, res) => {
    const { code, isEnabled } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Country code is required' });
    }

    const country = store.countries.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!country) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }

    country.isEnabled = Boolean(isEnabled);
    return res.json({
      success: true,
      message: `Country ${country.name} preference updated to ${country.isEnabled ? 'enabled' : 'disabled'}`,
      data: country
    });
  }
};

