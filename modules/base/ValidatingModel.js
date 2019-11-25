class ValidatingModel extends Model
{
    validations;
    validator;

    constructor(properties, validations) {
        super(properties);

        this.validations = validations || {};
        this.validator = new Validator(this.validations);
    }

    _onSet(key, value) {

        return value;
    }
}