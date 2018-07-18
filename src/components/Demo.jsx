import { compose } from 'redux';
import { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import TextField from './TextField';
import RadioField from './RadioField';
import SelectField from './SelectField';
import ButtonsField from './ButtonsField';
import BlockWrapper from './BlockWrapper';
import FieldWrapper from './FieldWrapper';
// import ReactReduxFormGenerator from '../../';
import ReactReduxFormGenerator from './ReactReduxFormGenerator';

import schema from '../data/schema.json';
import values from '../data/values.json';

import * as validators from '../utils/validators';

export default class Demo extends Component {

	state = {
		savedValues: values,
		invalidateFields: []
	}

	componentWillMount() {

		const savedValues = JSON.parse(localStorage.getItem('demo'));

		log('Demo -> componentWillMount', { savedValues });

		if (savedValues) this.setState({ savedValues });
	}

	handleChange = (name, value) => {

		log('Demo -> handleChange', { name, value });
	}

	handleSubmit = values => {

		log('Demo -> handleSubmit', { values });

		localStorage.setItem('demo', JSON.stringify(values));
	}

	handleValidate = invalidateFields => {

		log('Demo -> handleValidate', { invalidateFields });

		this.setState({ invalidateFields });
	}

	render() {

		const { savedValues, invalidateFields } = this.state;

		log('Demo -> render', { savedValues, invalidateFields });

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<ConnectedReactReduxFormGenerator
					id='demo'
					form='demo'
					Field={ Field }
					schema={ schema }
					validators={ validators }
					initialValues={ savedValues }
					onChange={ this.handleChange }
					onSubmit={ this.handleSubmit }
					onValidate={ this.handleValidate }
					templates={ {
						block: BlockWrapper,
						field: FieldWrapper,
						text: TextField,
						date: TextField,
						files: TextField,
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
				/>
				<div className='btn-group'>
					<button
						form='demo'
						type='submit'
						className='btn btn-primary btn-lg'
					>
						Submit after valid
					</button>
					<button
						form='demo'
						type='submit'
						disabled={ invalidateFields.length }
						className='btn btn-secondary btn-lg'
					>
						Disabled while invalid
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({ form: { demo } }) => ({ form: 'demo', data: demo ? demo.values : {} });

const ConnectedReactReduxFormGenerator = compose(connect(mapStateToProps), reduxForm({ enableReinitialize: true }))(ReactReduxFormGenerator);
