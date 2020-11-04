import * as React from 'react';
import PropTypes from 'prop-types';


export default class UserItem extends React.Component {
  handleClick = () => {
    this.props.onSelectMe(this.props.user);
  };

  render() {
    const {
      selected,
      user,
      children,
    } = this.props;
    const className = selected ? 'user selected' : 'user';
    return user ? (
      <div className={className}>
        <span>Id: {user.id}</span> -{' '}
        <span>{user.name}</span>{' '}
        <button onClick={this.handleClick} disabled={selected}>
          {children || 'select'}
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
