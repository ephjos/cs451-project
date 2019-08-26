import React from 'react';
import '../css/SideMenu.css';

export interface MenuProps {
  topChildren: JSX.Element[];
  midChildren: JSX.Element[];
  bottomChildren: JSX.Element[];
}

const SideMenu: React.FC<MenuProps> = (props) => {
  return (
    <div className="menu">
      <div className="menu-top">
        {props.topChildren}
      </div>
      <div className="menu-mid">
        {props.midChildren}
      </div>
      <div className="menu-bottom">
        {props.bottomChildren}
      </div>
    </div>
  );
};

export default SideMenu;