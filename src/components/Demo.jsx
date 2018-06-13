import { compose } from 'redux';
import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import TextField from './TextField';
import RadioField from './RadioField';
import SelectField from './SelectField';
import BlockWrapper from './BlockWrapper';
import FieldWrapper from './FieldWrapper';
import ReactReduxFormGenerator from './ReactReduxFormGenerator';

import schema from '../data/schema.json';

import * as validators from '../utils/validators';

export default class Demo extends Component {

	state = {
		savedValues: {
			name: 'Олег',
			age: ['30'],
			sex: 'man',
			email: 'Kujbor@ya.ru',
			password: 'qwe'
		},
		invalidateFields: []
	}

	componentWillMount() {

		const savedValues = localStorage.getItem('demo');

		log('Demo -> componentWillMount', { savedValues });

		if (savedValues) this.setState({ savedValues: JSON.parse(savedValues) });
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

		log('Demo -> render', { ReactReduxFormGenerator, typeofReactReduxFormGenerator: typeof ReactReduxFormGenerator });

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
					templates={{
						BlockWrapper,
						FieldWrapper,
						text: TextField,
						email: TextField,
						radios: RadioField,
						select: SelectField,
						password: TextField
					}}
				/>
				<button
					form='demo'
					type='submit'
					disabled={ invalidateFields.length }
					className='btn btn-primary btn-lg'
				>
					Submit
				</button>
			</div>
		);
	}
}

const mapStateToProps = ({ form: forms }, { form: name }) => ({ form: name, data: forms[name] ? forms[name].values : {} });

const ConnectedReactReduxFormGenerator = compose(connect(mapStateToProps), reduxForm({ enableReinitialize: true }))(ReactReduxFormGenerator);
