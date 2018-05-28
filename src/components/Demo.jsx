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

class Demo extends Component {

	static propTypes = {
		data: propTypes.object.isRequired
	}

	static defaultProps = {
		data: {}
	}

	handleSubmit = rest => {

		const { data } = this.props;

		log('Demo -> handleSubmit', { data, rest });
	}

	render() {

		const { data } = this.props;

		return (
			<div className='container d-flex flex-column justify-content-center h-100'>
				<h2>ReactReduxFormGenerator</h2>
				<hr />
				<FormGenerator
					form='demo'
					data={ data }
					schema={ schema }
					blockSelector='.form-group'
					templates={{
						BlockWrapper,
						FieldWrapper,
						text: TextField,
						email: TextField,
						radio: RadioField,
						select: SelectField,
						password: TextField
					}}
					onSubmit={ this.handleSubmit}
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

const mapStateToProps = state => ({ data: state.form.demo });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps)(Demo);
