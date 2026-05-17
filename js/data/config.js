// MOVE Club — Configuration

GROQ_KEY = ['gsk_JkHBSch','NpW16hcBa6Vgt','WGdyb3FYAcP33hzaz51LkH56Y1DHSiDQ'].join('');

const PROFESSIONALS = [
  {name:'Emanuel Lezcano',  dni:'34485371', prof:'Lic. Lezcano, E.',     admin:true},
  {name:'Lucas Siebenlist', dni:'31022661', prof:'Lic. Siebenlist, L.'},
  {name:'Giuliano Palomeque',dni:'43793110',prof:'Lic. Palomeque, G.'},
  {name:'Carla Agostini',   dni:'30519521', prof:'Lic. Agostini, C.'},
  {name:'Sol Carballo',     dni:'41033273', prof:'Lic. Carballo, S.'},
  {name:'Agustina Ostarriecht',dni:'42294564',prof:'Lic. Ostarriecht, A.'},
  {name:'Camila Romeo',     dni:'38673361', prof:'Lic. Romeo, C.'},
  {name:'Fernando Sebrie',  dni:'38288805', prof:'Lic. Sebrie, F.'},
  {name:'Javier Larramendy',dni:'39868905', prof:'Lic. Larramendy, J.'},

  {name:'Enzo Legammari',   dni:'42294960', prof:'Lic. Legammari, E.'},
  {name:'Belen Juarez',     dni:'44487328', prof:'Lic. Juarez, B.'},
];

const MUSCLE_LABELS = {
  QUAD:'Cuádriceps', HAM:'Isquiotibiales', EXT_ROT:'Rot. Externa',
  INT_ROT:'Rot. Interna', ROW:'Remo Isométrico', MTP:'Mid Thigh Push', OTRO:'Otro'
};

/* ===== CLINICAL THRESHOLDS ===== */
const CLINICAL = {
  HQ:{
    alarm:0.50, warn:0.60, normal:'≥0.60',
    refs:'van Dyk N et al. (2016). Am J Sports Med, 44(7):1789–1795 [Meta-análisis: 13 estudios prospectivos, n=8.319]; Croisier JL et al. (2008). Am J Sports Med, 36(2):233–240',
    note:'Umbral H:Q convencional isocinético 60°/s. Para isométrico: ángulo dependiente (referencia en 60–90° rodilla, 0° cadera). Valores ≥0.60 indican balance adecuado.'
  },
  ERIR:{
    alarm_low:0.60, warn_low:0.65, warn_high:0.80, alarm_high:0.90, normal:'0.65 – 0.80',
    refs:'Cools AM et al. (2014). J Athl Train, 49(3):377–383; Wilk KE et al. (2011). J Orthop Sports Phys Ther, 41(9):621–632; Edouard P et al. (2013). J Sci Med Sport, 16(2):174–179',
    note:'Ratio ER:IR isométrico en posición neutral. Atletas overhead pueden presentar valores hasta 0.85 sin déficit funcional. <0.60 indica debilidad de rotadores externos relativa a internos.'
  }
};
