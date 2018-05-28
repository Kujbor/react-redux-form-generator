import { Component } from 'react';

export default class FieldWrapper extends Component {

	render() {

		const { children } = this.props;

		return <div>{ children }</div>;
	}
}
