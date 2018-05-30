import { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';

import log from '../utils/log';
import schema from '../data/schema.json';
import TextField from './TextField';
import RadioField from './RadioField';
import SelectField from './SelectField';
import BlockWrapper from './BlockWrapper';
import FieldWrapper from './FieldWrapper';
import FormGenerator from './ReactReduxFormGenerator';

import * as validators from '../utils/validators';

class Demo extends Component {

	static propTypes = {
		form: propTypes.object.isRequired
	}

	static defaultProps = {
		form: {}
	}

	handleSubmit = values => log('Demo -> handleSubmit', { values })

	render() {

		const { form } = this.props;

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<FormGenerator
					form='demo'
					data={ form.values }
					schema={ schema }
					blockSelector='.form-group'
					validators={ validators }
					templates={{
						BlockWrapper,
						FieldWrapper,
						text: TextField,
						email: TextField,
						radio: RadioField,
						select: SelectField,
						password: TextField
					}}
					onSubmit={ this.handleSubmit }
				>
					<button
						type='submit'
						className='btn btn-primary btn-lg'
					>
						Submit
					</button>
				</FormGenerator>
			</div>
		);
	}
}

const mapStateToProps = state => ({ form: state.form.demo });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps)(Demo);
