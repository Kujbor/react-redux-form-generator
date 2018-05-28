import { Component } from 'react';

export default class BlockWrapper extends Component {

	render() {

		const { title, caption, children, fields } = this.props;

		return (
			<div className='card bg-light mb-3'>
				<div className='card-body'>
					{ title && <h3>{ title }</h3> }
					{ caption && <p>{ caption }</p> }
					{ children }
				</div>
			</div>
		);
	}
}
