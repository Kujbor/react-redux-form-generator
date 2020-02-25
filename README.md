# react-redux-form-generator
Forms generator for react/redux apps based on [redux-form](https://redux-form.com/7.4.2/) and JSON-schemas.

## Installation
```
npm install redux-form
npm install react-redux-form-generator
```

## Usage

```jsx
import _ from "lodash";
import { PureComponent } from "react";

import ReactReduxFormGeneratorWrapper from "./ReactReduxFormGeneratorWrapper";

// We will look closer to the schemas and values below in documentation
import formSchema from "../data/schema.json";
import initialValues from "../data/values.json";

export default class Demo extends PureComponent {
  state = {
    savedValues: initialValues,
    invalidateFields: {}
  };

  componentWillMount() {
    const savedValues = JSON.parse(localStorage.getItem("demo"));
    if (savedValues) this.setState({ savedValues });
  }

  handleChange = values => {
    console.log("Demo -> handleChange", { values });
  };

  handleSubmit = values => {
    localStorage.setItem("demo", JSON.stringify(values));
  };

  handleValidate = invalidateFields => {
    this.setState({ invalidateFields });
  };

  render() {
    const { savedValues, invalidateFields } = this.state;
    return (
      <>
        <h2>ReactReduxFormGenerator</h2>
        <hr />
        <ReactReduxFormGeneratorWrapper
          id="demo"
          form="demo"
          schema={formSchema}
          context={this}
          initialValues={savedValues}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          onValidate={this.handleValidate}
        />
        <button form="demo" type="submit">
          Submit after valid
        </button>
      </>
    );
  }
}
```

### Wrapper
The form generator uses the user-provided React Components for form fields (Input, Select, RadioButton etc.) and validation functions (for example required, onlyDigits). So, firstly, you need to create a wrapper that provides the generator with templates and validators and connects it to the redux-storage of the application.

You can simply copy and paste this file and only change templates and validators to yours:

```jsx
import _ from "lodash";
import { compose } from "redux";
import { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field, getFormValues, getFormSyncErrors } from "redux-form";

// Here you need to import your JSX-templates for the Field wrapper,
// the Fields` Block wrapper and the form controls themselves (Input, Radio etc)
// We`ll look closer to them below in this documentation
import TextField from "./TextField";
import RadioField from "./RadioField";
import SelectField from "./SelectField";
import BlockWrapper from "./BlockWrapper";
import FieldWrapper from "./FieldWrapper";

// Here you need to import your validate functions
// We`ll look closer to them below in this documentation
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
        // Specify your validate functions here
        validators={validators}
        initialValues={initialValues}
        onChange={onChange}
        onSubmit={onSubmit}
        // And here you need to provide your templates
        templates={{
          block: BlockWrapper,
          field: FieldWrapper,
          text: TextField,
          radio: RadioField,
          select: SelectField
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

### Props specification
<table>
	<tr>
		<th>id</th>
		<td>Passes string for DOM attribute <strong>id</strong> for <strong>&lt;form></strong> tag from parent components.</td>
	</tr>
	<tr>
		<th>data</th>
		<td>For pass state of form from redux store (<strong>ReactReduxFormGenerator</strong> not importing <strong>redux</strong> internally, so you need to provide it yourself).</td>
	</tr>
	<tr>
		<th>Field</th>
		<td>Field wrapper from <a href="https://redux-form.com/7.4.2/">redux-form</a> (<strong>ReactReduxFormGenerator</strong> not importing <strong>redux-form</strong> internally, so you need to provide it yourself). You can find out about <a href="https://redux-form.com/7.4.2/docs/api/field.md/">Field</a> on their website or just copy and paste this code shown above.</td>
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
		<td>
			You can provide any additional data here so that you can use it later inside the schema.
<pre>{
  ...
  isNew: true,
  status: 'created',
  ...
}</pre>
		</td>
	</tr>
	<tr>
		<th>onSubmit</th>
		<td>
			Callback function to provide it for <strong>handleSubmit(onSubmit)</strong> from <a href="https://redux-form.com/7.4.2/">redux-form</a>. You can find out about <a href="https://redux-form.com/7.4.2/docs/api/props.md/#-code-handlesubmit-eventorsubmit-function-code-">handleSubmit(onSubmit)</a> on their website or just copy and paste this code shown above.
			<pre>values => doSomething()</pre>
		</td>
	</tr>
	<tr>
		<th>templates</th>
		<td>
			Object of JSX-components that includes required templates (BlockWrapper and FieldWrapper) and the form controls themselves (Input, Radio etc).
<pre>
{
  BlockWrapper: ({ title, caption, children }) => ([
    &lt;h3>{title}&lt;/h3>
    &lt;p>{caption}&lt;/p>
    {children}
  ]),
  FieldWrapper: ({ children }) => ([
    &lt;>{children}&lt;/>
  ]),
  TextField: ({ type, meta, input, label }) => ([
    &lt;label>{label}&lt;/label>
    &lt;input type={type} {...input} />
    &lt;p>{meta.error}&lt;/p>
  ]),
  ...
}
</pre>
		</td>
	</tr>
	<tr>
		<th>validators</th>
		<td>
			The object of validation functions. Functions take the value of the field being checked and the values ​​of other fields of the form and should return an error that you can render later, or nothing if the value is valid.
<pre>{
  ...
  validationName: (value, otherValues) => {
    if (theValidationFailed()) return 'Detected some error'
  }
}</pre>
In addition, you can pass some additional parameters to validation scope from the schema using functions that return a validation function.
<pre>{
  ...
  anotherValidationName: extraParams => (value, otherValues) => {
    if (theValidationFailed()) return 'Detected yet another error'
  }
}</pre>
		</td>
	</tr>
	<tr>
		<th>initialValues</th>
		<td>
			An object with an initial state of form values in the same format as the form data in a reduct state.
<pre>{
  ...
  firstName: 'First Name',
  lastName: 'Last Name',
  ...
}</pre>
		</td>
	</tr>
</table>

### Form`s schema example
```json
[{
	"key": "simple-fields",
	"fields": [{
		"label": "Text Field",
		"name": "text_field",
		"type": "text",
		"validations": ["required"]
	}, {
		"label": "Radios Field",
		"name": "radios_field",
		"type": "radios",
		"options": [{
			"label": "First",
			"value": "1"
		}, {
			"label": "Second",
			"value": "2"
		}],
		"validations": ["required"]
	}, {
		"label": "Select Field",
		"name": "select_field",
		"type": "select",
		"options": [{
			"label": "First",
			"value": "1",
			"showIf": "data.radios_field !== '2'"
		}, {
			"label": "Second",
			"value": "2",
			"showIf": "data.radios_field !== '1'"
		}],
		"validations": ["required"]
	}]
}]
```

### Validate functions example
```js
export const required = value => !value ? 'Is required!' : undefined;
export const numeric = value => value && isNaN(value) ? 'Need to be a number' : undefined;
```
