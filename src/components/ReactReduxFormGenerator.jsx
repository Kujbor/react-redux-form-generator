import PropTypes from 'prop-types';
import { PureComponent } from 'react';

if (!PureComponent) throw new Error('Unable to load \'react\'');
if (!PropTypes) throw new Error('Unable to load \'PropTypes\'');

const noop = () => {};

export default class ReactReduxFormGenerator extends PureComponent {

	static propTypes = {
		id: PropTypes.string,
		data: PropTypes.objectOf(PropTypes.string),
		Field: PropTypes.func.isRequired,
		schema: PropTypes.arrayOf(PropTypes.shape({
			key: PropTypes.string.isRequired,
			fields: PropTypes.arrayOf(PropTypes.shape({
				name: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
				label: PropTypes.string,
				multiple: PropTypes.bool,
				options: PropTypes.arrayOf(PropTypes.object),
				extra: PropTypes.object,
				validations: PropTypes.arrayOf(PropTypes.string),
			})).isRequired,
		})).isRequired,
		children: PropTypes.node,
		context: PropTypes.objectOf(PropTypes.any),
		onSubmit: PropTypes.func,
		templates: PropTypes.objectOf(PropTypes.oneOfType([
			PropTypes.node,
			PropTypes.func,
			PropTypes.shape({
				$$typeof: PropTypes.symbol,
			}),
		])),
		validators: PropTypes.objectOf(PropTypes.func),
		handleSubmit: PropTypes.func.isRequired,
		initialValues: PropTypes.objectOf(PropTypes.string),
	};

	static defaultProps = {
		id: null,
		data: {},
		schema: [],
		children: null,
		templates: {},
		validators: {},
		initialValues: {},
		onSubmit: noop,
	};

	componentWillMount = () => {

		// const { schema } = this.props;

		this.normaliseSchema();
		// this.updateSchemaKeys(schema);
	}

	// componentWillReceiveProps = ({ schema: nextSchema }) => {

	// 	const { schema: prevSchema } = this.props;

	// 	if (nextSchema !== prevSchema) this.updateSchemaKeys(nextSchema);
	// }

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
			newBlock.key = this.getRandomHash();

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

	// updateSchemaKeys = schema => {

	// 	schema.forEach(block => {
	// 		if (!block.key) Object.assign(block, { key: this.getRandomHash() });
	// 	});
	// }

	isVisible = checker => {

		const { data, context } = this.props;

		return !checker || (data && new Function('data', 'context', `return ${ checker };`).call(this, data, context));
	}

	// isFieldValid = field => {

	// 	const { data } = this.props;

	// 	return this.getFieldValidators(field.validations).reduce((memo, validator) => memo && !validator(data[field.name], data), true);
	// }

	// getInvalidateFields = () => this.getVisibleFields().filter(field => !this.isFieldValid(field))

	// getAllVisible = () => {

	// 	const { schema } = this.props;

	// 	return schema.filter(block => this.isVisible(block.showIf)).map(block => ({
	// 		...block,
	// 		fields: block.fields.filter(field => this.isVisible(field.showIf))
	// 	})).filter(block => block.fields.length);
	// }

	// getVisibleFields = () => this.getAllVisible().reduce((memo, block) => memo.concat(block.fields), [])

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

	getRandomHash = () => Math.random().toString().substring(2);

	renderBlock = block => {

		const { title, caption, fields, parent, created, showIf } = block;
		const { data, templates: { block: BlockWrapper }, context } = this.props;

		if (parent && !created) return;
		if (!this.isVisible(showIf, data)) return;
		if (!fields.reduce((memo, field) => memo || field.type !== 'hidden', false)) return fields.map(field => this.renderWrapper(field));

		return (
			<BlockWrapper
				key={ block.key }
				title={ title }
				block={ block }
				fields={ fields }
				caption={ caption }
				context={ context }
				generator={ this }
			>
				{ fields.map(field => this.renderWrapper(field, block)) }
			</BlockWrapper>
		);
	}

	renderWrapper = (field, block) => {

		const { type, name, half, showIf } = field;
		const { data, templates: { field: FieldWrapper }, context } = this.props;

		if (!this.isVisible(showIf, data)) return;

		if (type === 'hidden') {

			return (
				<div key={ name } className='fieldWrapperInvisible' style={ { display: 'none' } }>
					{ this.renderField(field, block) }
				</div>
			);
		}

		return (
			<FieldWrapper
				key={ name }
				half={ half }
				field={ field }
				block={ block }
				context={ context }
				generator={ this }
				onClick={ event => this.handleClick(event, field) }
			>
				{ this.renderField(field) }
			</FieldWrapper>
		);
	}

	renderField = (field, block) => {

		const { type, name, label, multiple, options, validations, extra } = field;
		const { templates: { [type]: FieldRenderer }, Field, context } = this.props;

		if (!FieldRenderer) throw new Error(`Unable to find renderer for '${ type }' field type`);
		if (typeof FieldRenderer !== 'function' && !(typeof FieldRenderer === 'object' && FieldRenderer.$$typeof)) throw new Error(`Renderer for '${ type }' field type is not a function`);

		return (
			<Field
				type={ type }
				name={ name }
				field={ field }
				block={ block }
				label={ label || '' }
				extra={ extra || {} }
				context={ context }
				options={ this.getVisibleOptions(options) }
				validate={ this.getFieldValidators(validations) }
				multiple={ multiple }
				generator={ this }
				component={ FieldRenderer }
			/>
		);
	}

	render = () => {

		const {
			id,
			schema,
			children,
			onSubmit,
			// templates,
			handleSubmit
		} = this.props;

		// log('ReactReduxFormGenerator -> render', { schema, templates });

		return (
			<form id={ id } onSubmit={ handleSubmit(onSubmit) }>
				{ schema.map(block => this.renderBlock(block)) }
				{ children }
			</form>
		);
	}
}
