import { Component } from 'react';
import propTypes from 'prop-types';

if (!Component) throw new Error('Unable to load \'react\'');
if (!propTypes) throw new Error('Unable to load \'propTypes\'');

export default class ReactReduxFormGenerator extends Component {

	static propTypes = {
		id: propTypes.string,
		data: propTypes.object.isRequired,
		Field: propTypes.func.isRequired,
		schema: propTypes.array.isRequired,
		children: propTypes.node,
		onChange: propTypes.func,
		onSubmit: propTypes.func,
		templates: propTypes.object,
		validators: propTypes.object,
		handleSubmit: propTypes.func.isRequired,
		initialValues: propTypes.object
	};

	static defaultProps = {
		id: null,
		children: null,
		templates: {},
		validators: {},
		onChange: null,
		initialValues: {},
		onSubmit: () => {}
	};

	componentWillMount = () => {

		this.normaliseSchema();
	}

	handleClick = ({ target: { value } }, field) => {
		if (field.add && value && value !== 'no') this.addBlock(value);
	}

	addBlock = (name, silence) => {

		const { schema } = this.props;

		let lastBlockNumber;
		let newBlocksNumber;

		schema.forEach(block => {

			if (block.created || block.parent !== name) return;

			const lastBlockIndex = schema.reduce((memo, currentBlock, index) => currentBlock.parent === name ? index : memo, null);

			if (typeof newBlocksNumber === 'undefined') {

				lastBlockNumber = schema[lastBlockIndex].fields[0].name.match(/[0-9]+/);
				newBlocksNumber = lastBlockNumber === null ? 0 : +lastBlockNumber + 1;
			}

			const newBlock = JSON.parse(JSON.stringify(block));

			const parentExp = new RegExp('{ parent }', 'igm');
			const parentReplacer = () => `${ newBlock.parent }_${ newBlocksNumber }`;

			const previousExp = new RegExp('{ parent:previous }', 'igm');
			const previousReplacer = () => `${ newBlock.parent + (lastBlockNumber === null ? '' : `_${ lastBlockNumber }`) }`;

			newBlock.showIf = newBlock.showIf && newBlock.showIf.replace(parentExp, parentReplacer);
			newBlock.showIf = newBlock.showIf && newBlock.showIf.replace(previousExp, previousReplacer);

			newBlock.fields = newBlock.fields && newBlock.fields.map(field => {

				const newField = { ...field };

				newField.name = `${ newBlock.parent }_${ newBlocksNumber }-${ newField.name }`;

				newField.showIf = newField.showIf && newField.showIf.replace(parentExp, parentReplacer);
				newField.showIf = newField.showIf && newField.showIf.replace(previousExp, previousReplacer);

				newField.validations = newField.validations && newField.validations.map(validation => {

					let newValidation = validation;

					newValidation = newValidation.replace(parentExp, parentReplacer);
					newValidation = newValidation.replace(previousExp, previousReplacer);

					return newValidation;
				});

				newField.options = newField.options && newField.options.map(option => {

					const newOption = { ...option };

					newOption.showIf = newOption.showIf && newOption.showIf.replace(parentExp, parentReplacer);
					newOption.showIf = newOption.showIf && newOption.showIf.replace(previousExp, previousReplacer);

					return newOption;
				});

				return newField;
			});

			newBlock.created = true;

			schema.splice(lastBlockIndex + 1, 0, newBlock);
		});

		if (!silence) this.forceUpdate();
	}

	normaliseSchema = () => {

		const { initialValues, schema } = this.props;

		const fieldsNames = Object.keys(initialValues);

		for (let i = 0; i < fieldsNames.length; i += 1) {

			const isFieldExist = schema.reduce((memoBlock, block) =>
				memoBlock || block.fields.reduce((memoField, field) =>
					memoField || field.name === fieldsNames[i], false), false);

			if (!isFieldExist) {

				const fieldNameParts = fieldsNames[i].split(/_[0-9]+-/);

				const blockName = fieldNameParts[0];
				const fieldName = fieldNameParts[1];

				const baseBlock = schema.reduce((memoBlock, block) =>
					memoBlock || (block.parent === blockName ? block.fields.reduce((memoField, field) =>
						memoField || field.name === fieldName, false) ? block : null : null), null);

				if (baseBlock) {

					this.addBlock(baseBlock.parent, true);

					this.normaliseSchema();

					break;
				}
			}
		}
	}

	isVisible = checker => {

		const { data } = this.props;

		return !checker || (data && new Function('data', `return ${ checker };`).call(this, data));
	}

	isFieldValid = field => {

		const { data } = this.props;

		return this.getFieldValidators(field.validations).reduce((memo, validator) => memo && !validator(data[field.name], data), true);
	}

	getInvalidateFields = () => this.getVisibleFields().filter(field => !this.isFieldValid(field))

	getAllVisible = () => {

		const { schema } = this.props;

		return schema.filter(block => this.isVisible(block.showIf)).map(block => Object.assign({}, block, {
			fields: block.fields.filter(field => this.isVisible(field.showIf))
		})).filter(block => block.fields.length);
	}

	getVisibleFields = () => this.getAllVisible().reduce((memo, block) => memo.concat(block.fields), [])

	getVisibleOptions = (options = []) => options.filter(option => this.isVisible(option.showIf))

	fieldValidatorsCasche = {}

	getFieldValidators = (fieldValidations = []) => {

		const { validators } = this.props;

		return fieldValidations.map(validation => {

			if (typeof validation !== 'string') throw new Error('Validation name must be a string');

			if (validation.match(/\w+\([^()]*\)/igm)) {

				const name = validation.match(/^\w+/igm)[0];
				const args = validation.match(/[^()]+(?=\))/igm);

				if (!validators[name]) throw new Error(`Unable to find creator of the validator for '${ name }' validation`);
				if (typeof validators[name] !== 'function') throw new Error(`Creator of the validator for '${ name }' validation is not a function`);
				if (typeof validators[name]() !== 'function') throw new Error(`Creator of the validator for '${ name }' does not return a function`);

				const parsedArgs = args ? args[0].split(/,/).map(arg => JSON.parse(arg.replace(/'/igm, '"'))) : [];

				return this.fieldValidatorsCasche[validation] ? this.fieldValidatorsCasche[validation] : this.fieldValidatorsCasche[validation] = validators[name](...parsedArgs);
			}

			if (!validators[validation]) throw new Error(`Unable to find validator for '${ validation }' validation`);
			if (typeof validators[validation] !== 'function') throw new Error(`Validator for '${ validation }' validation is not a function`);

			return this.fieldValidatorsCasche[validation] ? this.fieldValidatorsCasche[validation] : this.fieldValidatorsCasche[validation] = validators[validation];
		});
	}

	renderBlock = (block, index) => {

		const { data, templates: { block: BlockWrapper } } = this.props;
		const { title, caption, fields, parent, created, showIf } = block;

		if (parent && !created) return;
		if (!this.isVisible(showIf, data)) return;
		if (!fields.reduce((memo, field) => memo || field.type !== 'hidden', false)) return fields.map(field => this.renderWrapper(field));

		return (
			<BlockWrapper
				id={ index }
				key={ index }
				title={ title }
				fields={ fields }
				caption={ caption }
			>
				{ fields.map(field => this.renderWrapper(field)) }
			</BlockWrapper>
		);
	}

	renderWrapper = field => {

		const { data, templates: { field: FieldWrapper } } = this.props;
		const { type, name, half, showIf } = field;

		if (!this.isVisible(showIf, data)) return;

		if (type === 'hidden') {

			return (
				<div key={ name } className='fieldWrapperInvisible' style={ { display: 'none' } }>
					{ this.renderField(field) }
				</div>
			);
		}

		return (
			<FieldWrapper
				key={ name }
				half={ half }
				onClick={ event => this.handleClick(event, field) }
			>
				{ this.renderField(field) }
			</FieldWrapper>
		);
	}

	renderField = ({ type, name, label, multiple, options, extra, validations }) => {

		const { templates: { [type]: FieldRenderer }, Field } = this.props;

		if (!FieldRenderer) throw new Error(`Unable to find renderer for '${ type }' field type`);
		if (typeof FieldRenderer !== 'function') throw new Error(`Renderer for '${ type }' field type is not a function`);

		return (
			<Field
				type={ type }
				name={ name }
				label={ label }
				extra={ extra }
				multiple={ multiple }
				component={ FieldRenderer }
				options={ this.getVisibleOptions(options) }
				validate={ this.getFieldValidators(validations) }
			/>
		);
	}

	render = () => {

		const {
			id,
			schema,
			children,
			onSubmit,
			handleSubmit
		} = this.props;

		return (
			<form id={ id } onSubmit={ handleSubmit(onSubmit) }>
				{ schema.map((block, index) => this.renderBlock(block, index)) }
				{ children }
			</form>
		);
	}
}
