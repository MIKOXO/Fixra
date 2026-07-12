export const REGIONS = [
  { value: 'Addis Ababa', label: 'Addis Ababa' },
  { value: 'Dire Dawa', label: 'Dire Dawa' },
  { value: 'Oromia', label: 'Oromia' },
  { value: 'Amhara', label: 'Amhara' },
  { value: 'Tigray', label: 'Tigray' },
  { value: 'SNNPR', label: 'SNNPR' },
  { value: 'Sidama', label: 'Sidama' },
  { value: 'Somali', label: 'Somali' },
  { value: 'Afar', label: 'Afar' },
  { value: 'Benishangul-Gumuz', label: 'Benishangul-Gumuz' },
  { value: 'Gambela', label: 'Gambela' },
  { value: 'Harari', label: 'Harari' },
  { value: 'Central Ethiopia', label: 'Central Ethiopia' },
];

const addisSubCities = [
  'Bole', 'Kirkos', 'Yeka', 'Arada', 'Lideta',
  'Kolfe Keranio', 'Nifas Silk Lafto', 'Akaky Kaliti',
  'Gullele', 'Addis Ketema', 'Lemi Kura',
];

const majorCities = {
  'Dire Dawa': ['Dire Dawa'],
  'Oromia': ['Adama', 'Jimma', 'Bishoftu', 'Shashamane', 'Ambo', 'Nekemte', 'Burayu', 'Sebeta', 'Holeta', 'Gimbi', 'Metehara', 'Asella', 'Bale Robe', 'Fiche', 'Dilla', 'Moyale'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Debre Birhan', 'Kombolcha', 'Woldia', 'Finote Selam', 'Shewa Robit', 'Kobo', 'Lalibela', 'Sekota'],
  'Tigray': ['Mekelle', 'Adigrat', 'Shire', 'Axum', 'Adwa', 'Humera', 'Alamata', 'Maychew', 'Abiy Addi', 'Korem'],
  'SNNPR': ['Hawassa', 'Arba Minch', 'Sodo', 'Wolaita Sodo', 'Dilla', 'Hosaena', 'Shashamane', 'Butajira', 'Bonga', 'Mizan Teferi', 'Jinka', 'Konso', 'Chencha'],
  'Sidama': ['Hawassa', 'Aleta Wondo', 'Yirgalem', 'Bona', 'Bensa'],
  'Somali': ['Jijiga', 'Gode', 'Degahbur', 'Kebri Dahar', 'Shinile', 'Fafan', 'Warder'],
  'Afar': ['Semera', 'Assayita', 'Awash', 'Dubti', 'Logia', 'Gewane'],
  'Benishangul-Gumuz': ['Assosa', 'Bambasi', 'Mend', 'Kamashi', 'Kurmuk'],
  'Gambela': ['Gambela', 'Abobo', 'Gog', 'Terekika', 'Jor'],
  'Harari': ['Harar', 'Dire Dawa'],
  'Central Ethiopia': ['Hosaena', 'Wolaita Sodo', 'Durame', 'Halaba', 'Kembata', 'Tembaro'],
};

export const getCitiesForRegion = (region) => {
  if (!region) return [];

  if (region === 'Addis Ababa') {
    return addisSubCities.map((c) => ({ value: c, label: c }));
  }

  const cities = majorCities[region];
  if (!cities) return [];

  return cities.map((c) => ({ value: c, label: c }));
};
