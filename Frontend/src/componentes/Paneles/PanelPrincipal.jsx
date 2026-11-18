import React from 'react';
import Drawer from 'rc-drawer';

const PanelPrincipal = ({
  DrawerOpen,
  closeDrawer,
  children: hijos,
  className = '',
  placement = 'right',
}) => {
  return (
    <Drawer
      open={DrawerOpen}
      onClose={closeDrawer}
      prefixCls="drawer"
      rootClassName={className}
      placement={placement}
      width={placement === 'left' ? 'min(88vw, 360px)' : 'min(100vw, 430px)'}>
      {hijos}
    </Drawer>
  );
};
export default PanelPrincipal;
