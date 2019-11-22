class Validator {

    errors;
    validations;
    validators;

    constructor(validations) {
        this.errors = {};
        this.validations = validations || [];
        this.validators = {
            min: this._validateMin,
            max: this._validateMax
        }
    }

    validate(sample) {
        if (typeof sample !== 'object') {
            console.error('[Validator] Parameter of type object must be passed');
            return false;
        }

        this._resetErrors();

        Object.keys(sample).forEach(key => {
            this.validateProperty(key, sample[key]);
        });

        return this;
    }

    validateProperty(parameter, value) {
        if(this.validations[parameter] && typeof value != undefined) {
            let validations = this.validations[parameter];

            Object.keys(validations).forEach(key => {
                if(this.validators[key]) {
                    if(this._runValidation(key, validations[key], value) === false) {
                        this._setError(parameter, key, validations[key], value);
                    };
                }
            });
        }

        return this;
    }

    getErrors() {
        return this.errors;
    }

    getError(property, key) {
        return this.errors[property] && this.errors[property][key];
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    /** 
     * Validator methods
     */
    _validateMax(bounds, input) {
        return input <= bounds;
    }

    _validateMin(bounds, input) {
        return input >= bounds;
    }

    /**
     * Internal methods
     */
    _runValidation(key, bounds, input) {
        return this.validators[key](bounds, input);
    }

    _setError(parameter, key, expected, actual) {
        this.errors[parameter] = this.errors[parameter] || {};
        this.errors[parameter][key] = {
            expected, actual
        };
    }

    _resetErrors() {
        this.errors = {};
    }
}