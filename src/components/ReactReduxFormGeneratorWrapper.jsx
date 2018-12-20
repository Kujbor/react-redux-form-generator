import _ from 'lodash';
import { compose } from 'redux';
import { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field, getFormValues, getFormSyncErrors } from 'redux-form';

import TextField from './TextField';
import RadioField from './RadioField';
import SelectField from './SelectField';
import ButtonsField from './ButtonsField';
import BlockWrapper from './BlockWrapper';
import FieldWrapper from './FieldWrapper';

import * as validators from '../utils/validators';

// import ReactReduxFormGenerator from '../../';
import ReactReduxFormGenerator from './ReactReduxFormGenerator';

class ReactReduxFormGeneratorWrapper extends Component {

	static propTypes = {
		id: propTypes.string,
		form: propTypes.string.isRequired,
		schema: propTypes.array.isRequired,
		data: propTypes.object,
		errors: propTypes.object,
		context: propTypes.object,
		children: propTypes.node,
		onChange: propTypes.func,
		onSubmit: propTypes.func,
		onValidate: propTypes.func,
		initialValues: propTypes.object
	};

	static defaultProps = {
		id: null,
		data: {},
		errors: {},
		children: null,
		initialValues: {},
		onChange: () => {},
		onSubmit: () => {},
		onValidate: () => {}
	};

	componentWillReceiveProps({ data: nextData, errors: nextErrors }) {

		const { onChange, data: prevData, onValidate, errors: prevErrors } = this.props;

		// log('ReactReduxFormGeneratorWrapper -> componentWillReceiveProps', { onValidate });

		if (!_.isEqual(nextData, prevData)) onChange(nextErrors);
		if (!_.isEqual(nextErrors, prevErrors)) onValidate(nextErrors);
	}

	render() {

		const {
			id,
			form,
			schema,
			context,
			children,
			onChange,
			onSubmit,
			initialValues
		} = this.props;

		// log('ReactReduxFormGeneratorWrapper -> render', { schema });

		return (
			<ConnectedReactReduxFormGenerator
				id={ id }
				form={ form }
				Field={ Field }
				schema={ schema }
				context={ context }
				validators={ validators }
				initialValues={ initialValues }
				onChange={ onChange }
				onSubmit={ onSubmit }
				templates={ {
					block: BlockWrapper,
					field: FieldWrapper,
					text: TextField,
					date: TextField,
					file: TextField,
					email: TextField,
					phone: TextField,
					static: TextField,
					radios: RadioField,
					select: SelectField,
					address: TextField,
					buttons: ButtonsField,
					turnover: SelectField,
					regselect: SelectField
				} }
			>
				{ children }
			</ConnectedReactReduxFormGenerator>
		);
	}
}

const mapStateToFormGeneratorProps = (state, { form: formName }) => ({
	form: formName,
	data: getFormValues(formName)(state)
});

const ConnectedReactReduxFormGenerator = compose(connect(mapStateToFormGeneratorProps), reduxForm({ enableReinitialize: true }))(ReactReduxFormGenerator);

const mapStateToGeneratorWrapperProps = (state, { form }) => ({
	data: getFormValues(form)(state),
	errors: getFormSyncErrors(form)(state)
});

export default connect(mapStateToGeneratorWrapperProps)(ReactReduxFormGeneratorWrapper);
