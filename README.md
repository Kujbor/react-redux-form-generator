# react-redux-form-generator
Forms generator for react/redux apps based on [redux-form](https://github.com/redux-form/redux-form) and JSON-schemas

## Installation

`npm install redux-form`
`npm install react-redux-form-generator`

## Documentation

The form generator uses the user-provided React Components for form fields (Input, Select, RadioButton etc.) and validation functions (for example required, onlyDigits). So, firstly, you need to create a wrapper that provides the generator with templates and validators and connects it to the redux-storage of the application.

### ReactReduxFormGeneratorWrapper

```jsx
import _ from "lodash";
import { compose } from "redux";
import { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field, getFormValues, getFormSyncErrors } from "redux-form";

import TextField from "./TextField";
import RadioField from "./RadioField";
import SelectField from "./SelectField";
import BlockWrapper from "./BlockWrapper";
import FieldWrapper from "./FieldWrapper";

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
        validators={validators}
        initialValues={initialValues}
        onChange={onChange}
        onSubmit={onSubmit}
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

ReactReduxFormGenerator not provides any onChange or onValidate events,
so if you need this – you need to handle data and error updates yourself
in componentWillReceiveProps as in the example above

### Props specification
* **id** DOM attribute id for <form> tag
* **data**
* **Field** Wrapper from redux-form 
* **schema**
* **children**
* **context**
* **onSubmit**
* **templates** JSX-component that wraps each form field,
* **validators**
* **handleSubmit**
* **initialValues**

### Simple example

```jsx
import _ from 'lodash';
import { PureComponent } from 'react';

import ReactReduxFormGeneratorWrapper from './ReactReduxFormGeneratorWrapper';

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

		// log('Demo -> render', { savedValues, invalidateFields });

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