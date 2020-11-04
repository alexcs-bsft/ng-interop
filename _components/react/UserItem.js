import * as React from 'react';
import PropTypes from 'prop-types';


export default class UserItem extends React.Component {
  handleClick = () => {
    this.props.onSelectMe(this.props.user);
  };

  render() {
    const className = this.props.selected ? 'user selected' : 'user';
    return this.props.user ? (
      <div className={className}>
        <span>Id: {this.props.user.id}</span> -{' '}
        <span>{this.props.user.name}</span>{' '}
        <button onClick={this.handleClick} disabled={this.props.selected}>
          select
        </button>
      </div>
    ) : null;
  }

  static propTypes = {
    user: PropTypes.object,
    selected: PropTypes.bool,
    onSelectMe: PropTypes.func,
  };
}
