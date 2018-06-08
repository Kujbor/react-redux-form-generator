import _ from 'lodash';
import { compose } from 'redux';
import { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

export class ReactReduxFormGenerator extends Component {

	static propTypes = {
		id: propTypes.string,
		form: propTypes.string.isRequired,
		data: propTypes.object.isRequired,
		schema: propTypes.array.isRequired,
		children: propTypes.node,
		onSubmit: propTypes.func,
		templates: propTypes.object,
		validators: propTypes.object,
		handleSubmit: propTypes.func.isRequired,
		handleChange: propTypes.func,
		initialValues: propTypes.object
	};

	static defaultProps = {
		id: null,
		data: {},
		children: null,
		templates: {},
		validators: {},
		handleChange: null,
		initialValues: {},
		onSubmit: () => {}
	};

	componentWillMount = () => {
		this.normaliseSchema();
	}

	handleChange = ({ target: { name } }) => {

		const { handleChange, data: { [name]: value } } = this.props;

		setTimeout(() => handleChange && handleChange(name, value));
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

				const newField = JSON.parse(JSON.stringify(field));

				newField.name = `${ newBlock.parent }_${ newBlocksNumber }-${ newField.name }`;

				newField.showIf = newField.showIf && newField.showIf.replace(parentExp, parentReplacer);
				newField.showIf = newField.showIf && newField.showIf.replace(previousExp, previousReplacer);

				newField.validations = newField.validations && newField.validations.map(validation => {

					let newValidation = JSON.parse(JSON.stringify(validation));

					newValidation = newValidation.replace(parentExp, parentReplacer);
					newValidation = newValidation.replace(previousExp, previousReplacer);

					return newValidation;
				});

				newField.options = newField.options && newField.options.map(option => {

					let newOption = JSON.parse(JSON.stringify(option));

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

		for (const name in initialValues) {

			const isFieldExist = schema.reduce((memoBlock, block) =>
				memoBlock || block.fields.reduce((memoField, field) =>
					memoField || field.name === name, false), false);

			if (isFieldExist) continue;

			const blockName = name.split(/_[0-9]+-/)[0];
			const fieldName = name.split(/_[0-9]+-/)[1];

			const baseBlock = schema.reduce((memoBlock, block) =>
				memoBlock || (block.parent === blockName ? block.fields.reduce((memoField, field) =>
					memoField || field.name === fieldName, false) ? block : null : null), null);

			if (!baseBlock) continue;

			this.addBlock(baseBlock.parent, true);

			this.normaliseSchema();

			break;
		}
	}

	isVisible = (checker, data) => {
		return !checker || (data && new Function('data', `return ${ checker };`).call(this, data));
	}

	isFieldValid = ({ field, data }) => {
		return this.getFieldValidatorsBinders(field.validations).reduce((memo, binder) => memo && !binder({ props: { data } })(data[field.name]), true);
	}

	getInvalidateFields = ({ schema, data }) => {
		return this.getVisibleFields(schema, data).filter(field => !this.isFieldValid({ field, data }));
	}

	getAllVisible = (schema, data) => {

		return schema.filter(block => this.isVisible(block.showIf, data)).map(block => Object.assign({}, block, {
			fields: block.fields.filter(field => this.isVisible(field.showIf, data))
		})).filter(block => block.fields.length);
	}

	getVisibleFields = (schema, data) => {
		return _.flatten(this.getAllVisible(schema, data).map(block => block.fields));
	}

	getVisibleOptions = (options = [], data) => {
		return options.filter(option => this.isVisible(option.showIf, data));
	}

	fieldValidatorsCasche = {}

	getFieldValidators = (fieldValidations = []) => {

		const { validators } = this.props;

		return fieldValidations.map(validation => {

			if (typeof validation !== 'string') throw new Error(`Validation name must be a string`);

			if (validation.match(/\w+\([^\(\)]*\)/igm)) {

				const name = validation.match(/^\w+/igm)[0];
				const args = validation.match(/[^\(\)]+(?=\))/igm);

				if (!validators[name]) throw new Error(`Unable to find creator of the validator for "${ name }" validation`);
				if (typeof validators[name] !== 'function') throw new Error(`Creator of the validator for "${ name }" validation is not a function`);
				if (typeof validators[name]() !== 'function') throw new Error(`Creator of the validator for "${ name }" does not return a function`);

				const parsedArgs = args ? args[0].split(/,/).map(arg => JSON.parse(arg.replace(/'/igm, '"'))) : [];

				return this.fieldValidatorsCasche[validation] ? this.fieldValidatorsCasche[validation] : this.fieldValidatorsCasche[validation] = validators[name].apply(this, parsedArgs);
			}

			if (!validators[validation]) throw new Error(`Unable to find validator for "${ validation }" validation`);
			if (typeof validators[validation] !== 'function') throw new Error(`Validator for "${ validation }" validation is not a function`);

			return this.fieldValidatorsCasche[validation] ? this.fieldValidatorsCasche[validation] : this.fieldValidatorsCasche[validation] = validators[validation].bind(this);
		});
	}

	renderBlock = (block, index) => {

		const { data, templates: { BlockWrapper } } = this.props;
		const { title, caption, fields, parent, created, showIf } = block;

		if (parent && !created) return;
		if (!this.isVisible(showIf, data)) return;

		if (!fields.reduce((memo, field) => {
			return memo || field.type !== 'hidden';
		}, false)) return fields.map(field => this.renderWrapper(field));

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

	renderWrapper = (field) => {

		const { data, templates: { FieldWrapper } } = this.props;
		const { type, name, half, showIf } = field;

		if (!this.isVisible(showIf, data)) return;

		if (type === 'hidden') return (
			<div key={ name } className='fieldWrapperInvisible' style={{ display: 'none' }}>
				{ this.renderField(field) }
			</div>
		);

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

		const { data, templates: { [type]: FieldRenderer } } = this.props;

		if (!FieldRenderer) throw new Error(`Unable to find renderer for "${ type }" field type`);
		if (typeof FieldRenderer !== 'function') throw new Error(`Renderer for "${ type }" field type is not a function`);

		return (
			<Field
				type={ type }
				name={ name }
				label={ label }
				extra={ extra }
				multiple={ multiple }
				options={ this.getVisibleOptions(options, data) }
				component={ FieldRenderer }
				validate={ this.getFieldValidators(validations) }
				onChange={ this.handleChange }
				onBlur={ this.handleChange }
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

const mapStateToProps = ({ form: forms }, { form: name }) => ({ form: name, data: forms[name] ? forms[name].values : {} });

export default compose(connect(mapStateToProps), reduxForm({ enableReinitialize: true }))(ReactReduxFormGenerator);
