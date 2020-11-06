import * as React from 'react';
import PropTypes from 'prop-types';


export default class UserItem extends React.Component {
  render() {
    const {
      selected,
      user,
      onSelectMe,
      unselectable,
      children,
    } = this.props;
    console.debug(this.props);

    return user ? (
      <div className={selected ? 'user selected' : 'user'}>
        <span>Id: {user.id}</span> -{' '}
        <span>{user.name}</span>{' '}
        {unselectable ? null :
        <button onClick={() => onSelectMe(user)} disabled={user.selected}>
          {children || 'select'}
        </button>
        }
      </div>
    ) : null;
  }

  static propTypes = {
    user: PropTypes.object,
    selected: PropTypes.bool,
    unselectable: PropTypes.bool,
    onSelectMe: PropTypes.func,
  };
}
