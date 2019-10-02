import React, { useRef } from 'react';
import {Shell, TransparentInput, BackgroundSpan, Guide} from './MaskedInput.styled'

/**
 * The masked input requires the following props
 * @param {string} id "The `id` is necessary for pairing up the form control with its associated label. It is also used by the script for pairing the mask with the form control."
 * @param {string} class The `class` of the input includes "masked" or other masking class set by the developer.
 * @param {string} pattern The `pattern` defines the regular expression the valid value must conform to. (You only want a mask if you have a pattern. If there is no pattern to match, there will be no mask that makes sense).
 * @param {string} placeholder The `placeholder` is the placeholder or masking text.
 * @param {string} name The `name` is required if you are submitting the form, as forms pass along name/value pairs.
 * @param {string} title The `title` attribute, which is not officially required, is essentially required whenever the `pattern` attribute is used for accessibility reasons: the `title` is used to describe the requirements of the regular expression.
 * @param {string} type The `type` of input should also be included, usually to `type="tel"` as most form controls that could make use of a masking are numeric values.
 * @param {string} [data-charset] - If your regular expressions include letters, you must include the made a made up attribute called `data-charset`.
 */

interface MaskedInputProps {
  id: string,
  class: string,
  pattern: string,
  placeholder: string,
  name: string,
  title: string,
  type: string,
  value: string,
  characterSet?: string,
  example?: string,
  label?: string,
  required?: boolean,
  validExample?: string,
  handleChange: (e: Event) => void,
  handleBlur?: (e: Event) => void,
  handleFocus?: (e: Event) => void,
}

export const MaskedInput = (props: MaskedInputProps) => {
  const guideRef = useRef(null);
  const handleChange = function(e) {
    e.target.value = handleCurrentValue(e);
    document.getElementById(props.id + 'Mask').innerHTML = setValueOfMask(e);
    props.handleChange && props.handleChange(e);
  };

  const handleCurrentValue = function(e) {
    var isCharsetPresent = props.characterSet ? true : false,
      maskedNumber = 'XMDY', // the available matches for a number charset
      maskedLetter = '_', // the available matches for a alphabetic charset
      placeholder = props.characterSet || props.placeholder,
      value = e.target.value,
      newValue = ''

    // strip special characters
    const strippedValue = isCharsetPresent ? value.replace(/\W/g, '') : value.replace(/\D/g, '');

    for (let i = 0, j = 0; i < placeholder.length; i++) {
      const isInt = !isNaN(parseInt(strippedValue[j]));
      const isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
      const matchesNumber = maskedNumber.indexOf(placeholder[i]) >= 0;
      const matchesLetter = maskedLetter.indexOf(placeholder[i]) >= 0;
      if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
        newValue += strippedValue[j++];
      } else if (
        (!isCharsetPresent && !isInt && matchesNumber) ||
        (isCharsetPresent && ((matchesLetter && !isLetter) || (matchesNumber && !isInt)))
      ) {
        //options.onError( e ); // write your own error handling function
        return newValue;
      } else {
        newValue += placeholder[i];
      }
      // break if no characters left and the pattern is non-special character
      if (strippedValue[j] == undefined) {
        break;
      }
    }

    if (props['data-valid-example']) {
      return validateProgress(e, newValue);
    }

    return newValue;
  };

  const setValueOfMask = function(e) {
    var value = e.target.value,
      placeholder = e.target.getAttribute('data-placeholder');

    return '<i>' + value + '</i>' + placeholder.substr(value.length);
  };

  const validateProgress = function(e, value) {
    var validExample = props['data-valid-example'],
      pattern = new RegExp(props.pattern),
      placeholder = e.target.getAttribute('data-placeholder'),
      l = value.length,
      testValue = '',
      i;

    //convert to months
    if (l == 1 && placeholder.toUpperCase().substr(0, 2) == 'MM') {
      if (value > 1 && value < 10) {
        value = '0' + value;
      }
      return value;
    }

    for (i = l; i >= 0; i--) {
      testValue = value + validExample.substr(value.length);
      if (pattern.test(testValue)) {
        return value;
      } else {
        value = value.substr(0, value.length - 1);
      }
    }

    return value;
  };

  const handleBlur = function(e) {
    var currValue = e.target.value,
      pattern;

    // if value is empty, remove label parent class
    if (currValue.length == 0) {
      if (e.target.required) {
        handleError(e, 'required');
      }
    } else {
      pattern = new RegExp('^' + props.pattern + '$');

      if (pattern.test(currValue)) {
      } else {

        handleError(e, 'invalidValue');
      }
    }
    props.handleBlur && props.handleBlur(e);
  };

  const handleError = function(e, errorMsg) {
    // the event and errorMsg name are passed. Label is already handled. What else do we do with error?
    //var possibleErrorMsgs = ['invalidValue', 'required'];
    return true;
  };

  const handleFocus = function(e) {

    props.handleFocus && props.handleFocus(e);
  };

  return (
      <>
        <label htmlFor={props.id}>{props.label}</label>
        <Shell>
          <BackgroundSpan aria-hidden="true" id={props.id + 'Mask'}>
            <Guide ref={guideRef}>{props.value || ''}</Guide>
            {props.placeholder}
          </BackgroundSpan>
          <TransparentInput
            id={props.id}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            name={props.id}
            type={props.type}

            data-placeholder={props.placeholder}
            data-pattern={props.pattern}
            data-valid-example={props.example}
            aria-required={props.required}
            data-charset={props.characterSet}
            required={props.required}
            title={props.title}
          />
        </Shell>
    </>
  );
};