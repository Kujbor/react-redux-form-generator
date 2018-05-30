import { Component } from 'react';

export default class FieldWrapper extends Component {

	render() {

		const { children, half, ...props } = this.props;

		return <div { ...props }>{ children }</div>;
	}
}
