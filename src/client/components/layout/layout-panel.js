import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { NetworkEditorController } from '../network-editor/controller';
import ColaPanel from './cola-panel';
import FCosePanel from './fcose-panel';
import CosePanel from './cose-panel';
import ConcentricPanel from './concentric-panel';
import DagrePanel from './dagre-panel';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { CircularLayoutIcon, ClusteredLayoutIcon, HierarchicalLayoutIcon } from '../svg-icons';

export class LayoutPanel extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    this.applyLayout = throttle((options) => {
      console.log('apply layout');
      this.controller.applyLayout(options);
    }, 250, { leading: true });

    const opProps = {
      onChange: (options) => this.handleOptionsChange(options),
    };
    const layouts = [
      // { name: 'cola', label: 'Clustered Cola', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <ColaPanel {...opProps} /> },
      { name: 'fcose', label: 'Clustered FCOSE', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <FCosePanel {...opProps} /> },
      // { name: 'cose', label: 'Clustered COSE', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <CosePanel {...opProps} /> },
      { name: 'concentric', label: 'Circular', icon: <CircularLayoutIcon {...iconProps} />, optionsPanel: <ConcentricPanel {...opProps} /> },
      { name: 'dagre', label: 'Hierarchical', icon: <HierarchicalLayoutIcon {...iconProps} />, optionsPanel: <DagrePanel {...opProps} /> },
    ];
    this.state = {
      value: 0,
      layouts: layouts,
    };
  }

  handleChange(value, options) {
    if (value != this.state.value) {
      this.setState(Object.assign(this.state, { value: value }));
    }

    if (value > 0) {
      const name = this.state.layouts[value - 1].name;
      this.applyLayout(Object.assign({ name: name }, options));
    }
  }

  handleOptionsChange(options) {
    this.handleChange(this.state.value, options);
  }

  render() {
    const { value, layouts } = this.state;
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <AppBar position="relative" color="default">
          <Tabs
            value={value}
            onChange={(e, v) => this.handleChange(v)}
            variant="scrollable"
            scrollButtons="on"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab key={0} style={{ display: 'none' }} {...a11yProps(0)} />
            {layouts.map((el, i) => (
              <Tab key={i + 1} label={el.label} icon={el.icon} {...a11yProps(i + 1)} />
            ))}
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0} style={{ display: 'none' }} />
        {layouts.map((el, i) => (
          <TabPanel key={i + 1} value={value} index={i + 1}>
            {el.optionsPanel}
          </TabPanel>
        ))}
      </div>
    );
  }
}

const iconProps = {
  viewBox: '0 0 96 64',
  style: { width: 'auto', fontSize: 38, margin: 0 },
  p: 0,
  m: 0,
};

function useStyles() {
  return makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }));
}

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      position="relative"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>{children}</Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

LayoutPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default LayoutPanel;