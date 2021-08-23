import {
  hasOwn,
  hyphenate,
  isArray,
  isObject,
  isPlainObject,
  makeMap,
} from '@vue/shared';


const trueNoop = () => true;

/**
 * @param propOptions
 * @return {{ requiredProps: string[], validateRequiredProps:(function(Object): boolean) }}
 */
export default function getRequiredValidator(propOptions) {
  // Can't declare any required props with the array-style
  if (Array.isArray(propOptions) || !propOptions) {
    return { requiredProps: null, validateRequiredProps: trueNoop };
  }

  /** @type Array<[string,Object]> */
  const requiredProps = Object.entries(propOptions).filter(([k, v]) => (
    isPlainObject(v)
    && v.required === true
  ));

  /**
   * @param {Object} propValues
   * @return {boolean}
   */
  function validateRequiredProps(propValues) {
    return requiredProps.every(([propName, prop]) => {
      const value = propValues[propName];
      const isAbsent = (
        !hasOwn(propValues, propName)
        && !hasOwn(propValues, hyphenate(propName))
      );

      return validateProp(value, prop, isAbsent);
    });
  }
  return {
    requiredProps: requiredProps.map(([name]) => name),
    validateRequiredProps: requiredProps.length
      ? validateRequiredProps
      : trueNoop,
  };
}

// Everything from here down is lifted/derived from componentProps.ts

/**
 * Tweaked from {@link http://github.com/vuejs/vue-next/blob/7ffa225aa334f0fd7da6ba30bee9109de3597643/packages/runtime-core/src/componentProps.ts#L580-L617|componentProps.ts#validateProps}
 * @param value
 * @param prop
 * @param isAbsent
 * @return {boolean}
 */
function validateProp(value, prop, isAbsent) {
  if (isAbsent) return false;

  const { type, validator } = prop;

  // type check
  if (type != null && type !== true) {
    let isValid = false;
    const types = isArray(type) ? type : [type];
    const expectedTypes = []; // TODO: should we return this somehow?
    // value is valid as long as one of the specified types match
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i]);
      expectedTypes.push(expectedType || '');
      isValid = valid;
    }
    // Only call `validator` if the type checks pass first
    if (!isValid || !validator) {
      return isValid;
    }
  }
  // custom validator
  if (validator) {
    return validator(value);
  }
}

function assertType(value, type) {
  let valid;
  const expectedType = getType(type);
  if (isSimpleType(expectedType)) {
    const t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isObject(value);
  } else if (expectedType === 'Array') {
    valid = isArray(value);
  } else if (expectedType === 'null') {
    valid = value === null;
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType,
  }
}

// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ctor === null ? 'null' : '';
}

const isSimpleType = /*#__PURE__*/ makeMap(
  'String,Number,Boolean,Function,Symbol,BigInt'
);
