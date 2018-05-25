import _ from 'lodash';
// import { extend } from 'jquery';
// import { compose } from 'redux';
import { Component } from 'react';
import propTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { reduxForm, Field } from 'redux-form';

// import FileField from './FileField';
// import DateField from './DateField';
// import TextField from './TextField';
// import PhoneField from './PhoneField';
// import RadioField from './RadioField';
// import SelectField from './SelectField';
// import StaticField from './StaticField';
// import ButtonsField from './ButtonsField';
// import AddressField from './AddressField';
// import TurnoverField from './TurnoverField';
// import FieldWrapper from './FieldWrapper';
// import BlockWrapper from './BlockWrapper';

// import countries from './countries.json';
// import taxDepartments from './taxDepartments.json';

// import * as validators from './validators';

export class ReactReduxFormGenerator extends Component {

	static propTypes = {
		id: propTypes.string,
		form: propTypes.string.isRequired,
		data: propTypes.object.isRequired,
		schema: propTypes.array.isRequired,
		change: propTypes.func.isRequired,
		children: propTypes.node,
		onSubmit: propTypes.func,
		handleSubmit: propTypes.func.isRequired,
		handleChange: propTypes.func,
		initialValues: propTypes.object,
		eventHandlers: propTypes.object,
		blockSelector: propTypes.string.isRequired
	};

	static defaultProps = {
		id: null,
		children: null,
		handleChange: null,
		initialValues: {},
		eventHandlers: {},
		onSubmit: () => {}
	};

	constructor(props) {

		super(props);

		this.isVisible = this.constructor.isVisible;
		this.isFieldValid = this.constructor.isFieldValid;
		this.getAllVisible = this.constructor.getAllVisible;
		this.getVisibleFields = this.constructor.getVisibleFields;
		this.getVisibleOptions = this.constructor.getVisibleOptions;
		this.getInvalidateFields = this.constructor.getInvalidateFields;
		this.getFieldValidatorsBinders = this.constructor.getFieldValidatorsBinders;

		this.normaliseSchema();
	}

	componentWillMount() {
		$(document).on('scroll', this.handleWindowScroll);
	}

	componentWillUnmount() {
		$(document).off('scroll', this.handleWindowScroll);
	}

	componentDidMount() {
		this.handleWindowScroll();
		this.scrollToFirstIncompleteRequiredField();
	}

	handleBlockFocus = event => {
		this.scrollToBlock(event.currentTarget);
	}

	handleWindowScroll = () => {

		const { form, props: { blockSelector } } = this;

		const $allBlocks = $(form).find(blockSelector);

		const center = document.documentElement.clientHeight / 2;

		const $currentBlock = $allBlocks.filter((index, block) => {

			const bounds = block.getBoundingClientRect();

			return bounds.top < center && bounds.bottom > center;
		});

		$allBlocks.removeClass('active');
		$currentBlock.addClass('active');
	}

	handleChange = ({ target }) => {

		const { name } = target;
		const { blockSelector, handleChange, change, data: { [name]: value } } = this.props;

		setTimeout(() => {

			if (handleChange) handleChange(name, value, change);

			const changedControl = $(target).get(0);
			const focusedControl = $(':focus').get(0);
			const $currentControl = $(focusedControl || changedControl);
			const $currentBlock = $currentControl.closest(blockSelector);

			this.scrollToFirstIncompleteBlock($currentBlock.attr('id'));
		});
	}

	handleEnterKeyPress = event => {

		if (event.key === 'Enter') {

			this.handleChange(event);

			event.target.blur();
		}
	}

	handleClick = ({ target: { value } }, field) => {
		if (field.add && value && value !== 'no') this.addBlock(value);
	}

	scrollToBlock = block => setTimeout(() => {

		const $block = $(block);

		if (!$block.find(':focus').length) {

			window.scroll({ top: block.offsetTop, behavior: 'smooth' });

			setTimeout(() => {

				$block
					.find('[name]')
					.filter((index, field) => !$(field).val())
					.first()
					.focus();
			}, 500);
		}
	})

	scrollToField = field => setTimeout(() => {

		const $field = $(field);

		window.scroll({ top: field.offsetTop, behavior: 'smooth' });

		setTimeout(() => $field.focus(), 500);
	})

	scrollToFirstIncompleteBlock = (currentIndex, secondTry) => {

		// Method disabled while the algorithm is not confirmed
		return;

		const { schema, data } = this.props;

		let finded;

		for (const blockIndex in schema) {

			const block = schema[blockIndex];

			if (!secondTry && !finded && blockIndex !== currentIndex) continue;
			else finded = true;

			if (block.parent && !block.created) continue;
			if (!this.isVisible(block.showIf, data)) continue;

			for (const fieldIndex in block.fields) {

				const field = block.fields[fieldIndex];
				const validations = field.validations;

				if (field.type === 'hidden') continue;
				if (data[field.name]) continue;
				if (secondTry && (!validations || validations.indexOf('required') === -1)) continue;
				if (!this.isVisible(field.showIf, data)) continue;

				return this.scrollToBlock($(`#${ blockIndex }`).get(0));
			}
		}

		if (!secondTry) this.scrollToFirstIncompleteBlock(currentIndex, true);
	}

	scrollToFirstIncompleteRequiredField = () => {

		const { schema, data } = this.props;

		const invalidateFields = this.getInvalidateFields({ schema, data });

		if (invalidateFields.length) this.scrollToField($(`[name="${ invalidateFields[0].name }"]`).get(0));
	}

	addBlock(name, silence) {

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

	normaliseSchema() {

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

	static isVisible(checker, data) {
		return !checker || (data && new Function('data', `return ${ checker };`).call(this, data));
	}

	static isFieldValid({ field, data }) {
		return this.getFieldValidatorsBinders(field.validations).reduce((memo, binder) => memo && !binder({ props: { data } })(data[field.name]), true);
	}

	static getInvalidateFields({ schema, data }) {
		return this.getVisibleFields(schema, data).filter(field => !this.isFieldValid({ field, data }));
	}

	static getAllVisible(schema, data) {

		return schema.filter(block => this.isVisible(block.showIf, data)).map(block => extend({}, block, {
			fields: block.fields.filter(field => this.isVisible(field.showIf, data))
		})).filter(block => block.fields.length);
	}

	static getVisibleFields(schema, data) {
		return _.flatten(this.getAllVisible(schema, data).map(block => block.fields));
	}

	static getVisibleOptions(options, data) {
		return options.filter(option => this.isVisible(option.showIf, data));
	}

	static getFieldValidatorsBinders(fieldValidations = []) {

		return fieldValidations.map(validation => {

			if (validation.match(/\w+\([^\(\)]+\)/igm)) {

				const name = validation.match(/^\w+/igm)[0];
				const args = validation.match(/[^\(\)]+(?=\))/igm)[0].split(/,/);

				const parsedArgs = args.map(arg => JSON.parse(arg.replace(/'/igm, '"')));

				return context => validators[name].apply(context, parsedArgs);
			}

			return context => (validators[validation] || validation).bind(context);
		});
	}

	getBindedFieldValidators(fieldValidations) {
		return this.getFieldValidatorsBinders(fieldValidations).map(binder => binder(this));
	}

	renderBlock(block, index) {

		const { data } = this.props;
		const { title, caption, fields, parent, created, showIf } = block;

		if (parent && !created) return;
		if (!this.isVisible(showIf, data)) return;

		if (!fields.reduce((memo, field) => {
			return memo || field.type !== 'hidden';
		}, false)) return fields.map(field => this.renderWrappedField(field));

		return (
			<BlockWrapper
				id={ index }
				key={ index }
				title={ title }
				fields={ fields }
				caption={ caption }
				onFocus={ this.handleBlockFocus }
			>
				{ fields.map(field => this.renderWrappedField(field)) }
			</BlockWrapper>
		);
	}

	renderWrappedField(field) {

		const { data } = this.props;
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

	renderField = field => ({
		// regselect: this.renderRegSelectField,
		turnover: this.renderTurnoverField,
		address: this.renderAddressField,
		country: this.renderCountryField,
		buttons: this.renderButtonsField,
		select: this.renderSelectField,
		static: this.renderStaticField,
		radio: this.renderRadioField,
		phone: this.renderPhoneField,
		date: this.renderDateField,
		file: this.renderFileField
	}[field.type] || this.renderDefaultField)(field)

	renderStaticField = ({ type, name, label, extra, validations }) => (
		<Field
			type={ type }
			name={ name }
			label={ label }
			extra={ extra }
			component={ StaticField }
			validate={ this.getBindedFieldValidators(validations) }
		/>
	)

	renderTurnoverField = ({ name, label, placeholder, validations }) => (
		<Field
			name={ name }
			label={ label }
			placeholder={ placeholder || '' }
			component={ TurnoverField }
			validate={ this.getBindedFieldValidators(validations) }
			onChange={ this.handleChange }
		/>
	)

	renderRegSelectField = ({ name, label, placeholder, validations }) => (
		<Field
			name={ name }
			options={ taxDepartments }
			label={ label }
			placeholder={ placeholder || '' }
			component={ SelectField }
			validate={ this.getBindedFieldValidators(validations) }
			onChange={ this.handleChange }
		/>
	)

	renderFileField = ({ name, label, caption, extra, validations }) => {

		const { uuid } = this.props;

		return (
			<Field
				uuid={ uuid }
				name={ name }
				label={ label }
				caption={ caption }
				extra={ extra }
				component={ FileField }
				validate={ this.getBindedFieldValidators(validations) }
				onChange={ this.handleChange }
			/>
		);
	}

	renderAddressField = ({ name, label, placeholder, validations }) => (
		<Field
			name={ name }
			label={ label }
			placeholder={ placeholder || '' }
			component={ AddressField }
			validate={ this.getBindedFieldValidators(validations) }
			onBlur={ this.handleChange }
		/>
	)

	renderCountryField = ({ name, label, multiple, placeholder, validations }) => {

		const { data } = this.props;

		return (
			<Field
				name={ name }
				options={ this.getVisibleOptions(countries, data) }
				label={ label }
				placeholder={ placeholder || '' }
				component={ SelectField }
				multiple={ multiple }
				validate={ this.getBindedFieldValidators(validations) }
				onChange={ this.handleChange }
			/>
		);
	}

	renderPhoneField = ({ name, label, extra, validations }) => (
		<Field
			name={ name }
			label={ label }
			extra={ extra }
			component={ PhoneField }
			validate={ this.getBindedFieldValidators(validations) }
			onKeyPress={ this.handleEnterKeyPress }
			onBlur={ this.handleChange }
		/>
	)

	renderSelectField = ({ name, label, placeholder, options, multiple, validations, extra }) => {

		const { data } = this.props;

		return (
			<Field
				name={ name }
				label={ label }
				extra={ extra }
				placeholder={ placeholder || '' }
				options={ this.getVisibleOptions(options, data) }
				component={ SelectField }
				multiple={ multiple }
				validate={ this.getBindedFieldValidators(validations) }
				onChange={ this.handleChange }
			/>
		);
	}

	renderRadioField = ({ name, label, options, validations }) => {

		const { data } = this.props;

		return (
			<Field
				name={ name }
				label={ label }
				options={ this.getVisibleOptions(options, data) }
				component={ RadioField }
				validate={ this.getBindedFieldValidators(validations) }
				onChange={ this.handleChange }
			/>
		);
	}

	renderButtonsField = ({ name, label, options, validations }) => {

		const { data } = this.props;

		const visibleOptions = this.getVisibleOptions(options, data);
		const bindedFieldValidators = this.getBindedFieldValidators(validations);

		return (
			<Field
				name={ name }
				label={ label }
				options={ visibleOptions }
				component={ ButtonsField }
				validate={ bindedFieldValidators }
				onChange={ this.handleChange }
			/>
		);
	}

	renderDateField = ({ name, label, validations }) => (
		<Field
			name={ name }
			label={ label }
			component={ DateField }
			validate={ this.getBindedFieldValidators(validations) }
			onKeyPress={ this.handleEnterKeyPress }
			onBlur={ this.handleChange }
		/>
	)

	renderDefaultField = ({ type, name, label, placeholder, validations, component, extra, defaultValue }) => (
		<Field
			type={ type }
			name={ name }
			label={ label }
			extra={ extra }
			defaultValue={ defaultValue }
			placeholder={ placeholder || '' }
			component={ component || TextField }
			validate={ this.getBindedFieldValidators(validations) }
			onKeyPress={ this.handleEnterKeyPress }
			onBlur={ this.handleChange }
		/>
	)

	render() {

		const {
			id,
			schema,
			children,
			onSubmit,
			handleSubmit,
			eventHandlers
		} = this.props;

		return (
			<form
				id={ id }
				className='formGenerator'
				ref={ node => this.form = node }
				onSubmit={ handleSubmit(onSubmit) }
				{ ...eventHandlers }
			>
				{ schema.map((block, index) => this.renderBlock(block, index)) }
				{ children }
			</form>
		);
	}
}

const mapStateToProps = (state, props) => ({ form: props.form });

export default compose(connect(mapStateToProps), reduxForm({ enableReinitialize: true }))(FormGenerator);
