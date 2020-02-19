# react-redux-form-generator
Forms generator for react/redux apps based on [redux-form](https://github.com/redux-form/redux-form) and JSON-schemas.

## Installation

`npm install redux-form`
`npm install react-redux-form-generator`

## Documentation
The form generator uses the user-provided React Components for form fields (Input, Select, RadioButton etc.) and validation functions (for example required, onlyDigits). So, firstly, you need to create a wrapper that provides the generator with templates and validators and connects it to the redux-storage of the application.

### ReactReduxFormGeneratorWrapper
You can simply copy and paste this file and only change templates and validators to yours:

```jsx
import _ from "lodash";
import { compose } from "redux";
import { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field, getFormValues, getFormSyncErrors } from "redux-form";

// Here you need to import your JSX-templates for the Field wrapper,
// the Fields` Block wrapper and the form controls themselves (Input, Radio etc).
// We`ll look closer to them below in documentation
import TextField from "./TextField";
import RadioField from "./RadioField";
import SelectField from "./SelectField";
import BlockWrapper from "./BlockWrapper";
import FieldWrapper from "./FieldWrapper";

// Here you need to import your validate functions
// We`ll look closer to them below in documentation
import * as validators from "../utils/validators";

import ReactReduxFormGenerator from "./ReactReduxFormGenerator";

class ReactReduxFormGeneratorWrapper extends Component {

  componentWillReceiveProps({ data: nextData, errors: nextErrors }) {

    const {
      onChange,
      data: prevData,
      onValidate,
      errors: prevErrors
    } = this.props;

    // ReactReduxFormGenerator not provides any onChange or onValidate events,
    // so if you need this – you need to handle data and errors updates yourself
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

    return (
      <ConnectedReactReduxFormGenerator
        id={id}
        form={form}
        Field={Field}
        schema={schema}
        context={context}
        validators={validators} // Specify your validators here
        initialValues={initialValues}
        onChange={onChange}
        onSubmit={onSubmit}
        // And here you need to provide your templates
        templates={{
          block: BlockWrapper,
          field: FieldWrapper,
          text: TextField,
          radio: RadioField,
          select: SelectField,
        }}
      >
        {children}
      </ConnectedReactReduxFormGenerator>
    );
  }
}

const mapStateToFormGeneratorProps = (state, { form: formName }) => ({
  form: formName,
  data: getFormValues(formName)(state)
});

const ConnectedReactReduxFormGenerator = compose(
  connect(mapStateToFormGeneratorProps),
  reduxForm({ enableReinitialize: true })
)(ReactReduxFormGenerator);

const mapStateToGeneratorWrapperProps = (state, { form }) => ({
  data: getFormValues(form)(state),
  errors: getFormSyncErrors(form)(state)
});

export default connect(mapStateToGeneratorWrapperProps)(
  ReactReduxFormGeneratorWrapper
);
```
Then you can use ReactReduxFormGeneratorWrapper for generating forms as in example below.

### Simple example
If you created ReactReduxFormGeneratorWrapper as above without changes
(other than specifying your templates and validators)
you can now start to generate forms:

```jsx
import _ from 'lodash';
import { PureComponent } from 'react';

import ReactReduxFormGeneratorWrapper from './ReactReduxFormGeneratorWrapper';

// We will look closer to the schemas and values below in documentation
import formSchema from '../data/schema.json';
import initialValues from '../data/values.json';

export default class Demo extends PureComponent {

	state = {
		savedValues: initialValues,
		invalidateFields: {}
	}

	componentWillMount() {

		const savedValues = JSON.parse(localStorage.getItem('demo'));

		log('Demo -> componentWillMount', { savedValues });

		if (savedValues) this.setState({ savedValues });
	}

	handleChange = values => {

		log('Demo -> handleChange', { values });
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
				<ReactReduxFormGeneratorWrapper
					id='demo'
					form='demo'
					schema={ formSchema }
					context={ this }
					initialValues={ savedValues }
					onChange={ this.handleChange }
					onSubmit={ this.handleSubmit }
					onValidate={ this.handleValidate }
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
						disabled={ !_.isEmpty(invalidateFields) }
						className='btn btn-secondary btn-lg'
					>
						Disabled while invalid
					</button>
				</div>
			</div>
		);
	}
}
```

### Props specification
<table>
	<tr>
		<th>id</th>
		<td>Passes DOM attribute <strong>id</strong> for <strong>&lt;form&gt;</strong> tag from parent components</td>
	</tr>
	<tr>
		<th>data</th>
		<td>For pass state of form from redux store (<strong>ReactReduxFormGenerator</strong> not importing <strong>redux</strong> internally, so you need to provide it yourself)</td>
	</tr>
	<tr>
		<th>Field</th>
		<td>Field wrapper from <strong>redux-form</strong> (<strong>ReactReduxFormGenerator</strong> not importing <strong>redux-form</strong> internally, so you need to provide it yourself)</td>
	</tr>
	<tr>
		<th>schema</th>
		<td>Form`s schema passed from parent component</td>
	</tr>
	<tr>
		<th>children</th>
		<td>Children, passed from parent component for rendering at the bottom of the form (for exemple: very beautiful submit button)</td>
	</tr>
	<tr>
		<th>context</th>
		<td></td>
	</tr>
	<tr>
		<th>onSubmit</th>
		<td></td>
	</tr>
	<tr>
		<th>templates</th>
		<td>JSX-component that wraps each form field</td>
	</tr>
	<tr>
		<th>validators</th>
		<td></td>
	</tr>
	<tr>
		<th>handleSubmit</th>
		<td></td>
	</tr>
	<tr>
		<th>initialValues</th>
		<td></td>
	</tr>
</table>
