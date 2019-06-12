const MIN_GALAXY = 0;
const MAX_GALAXY = 255;
const MIN_STAR = 256;
const MAX_STAR = 65535;
const MIN_PLANET = 65536;
const MAX_PLANET = 4294967297;

const PLANET_ENTROPY_BITS = 64;
const STAR_ENTROPY_BITS = 128;
const GALAXY_ENTROPY_BITS = 384;

const SEED_ENTROPY_BITS = 128;

const GEN_STATES = {
  ENY_NOSTART: Symbol('ENY_NOSTART'),
  ENY_PENDING: Symbol('ENY_PENDING'),
  ENY_SUCCESS: Symbol('ENY_SUCCESS'),
  ENY_FAILURE: Symbol('ENY_FAILURE'),
  DERIVATION_NOSTART: Symbol('DERIVATION_NOSTART'),
  DERIVATION_PENDING: Symbol('DERIVATION_PENDING'),
  DERIVATION_SUCCESS: Symbol('DERIVATION_SUCCESS'),
  DERIVATION_FAILURE: Symbol('DERIVATION_FAILURE'),
  PAPER_NOSTART: Symbol('PAPER_NOSTART'),
  PAPER_PENDING: Symbol('PAPER_PENDING'),
  PAPER_SUCCESS: Symbol('PAPER_SUCCESS'),
  PAPER_FAILURE: Symbol('PAPER_FAILURE'),
};

const BUTTON_STATES = {
  NOSTART: Symbol('NOSTART'),
  SUCCESS: Symbol('SUCCESS'),
  ERROR: Symbol('ERROR'),
  PENDING: Symbol('PENDING'),
};

const PROFILE_STATES = {
  NOSTART: Symbol('NOSTART'),
  UPLOAD_SUCCESS: Symbol('UPLOAD_SUCCESS'),
  UPLOAD_ERROR: Symbol('UPLOAD_ERROR'),
  INPUT_SUCCESS: Symbol('INPUT_SUCCESS'),
  INPUT_ERROR: Symbol('INPUT_ERROR'),
};

export {
  GEN_STATES,
  BUTTON_STATES,
  PROFILE_STATES,
  MIN_GALAXY,
  MAX_GALAXY,
  MIN_STAR,
  MAX_STAR,
  MIN_PLANET,
  MAX_PLANET,
  PLANET_ENTROPY_BITS,
  STAR_ENTROPY_BITS,
  GALAXY_ENTROPY_BITS,
  SEED_ENTROPY_BITS,
};
