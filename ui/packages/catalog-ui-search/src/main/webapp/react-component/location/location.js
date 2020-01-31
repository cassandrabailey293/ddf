/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
const React = require('react')

const CustomElements = require('../../js/CustomElements.js')

const Button = require('../button')
const Dropdown = require('../dropdown')
const { Menu, MenuItem } = require('../menu')
import styled from 'styled-components'
const {
  validateInput,
} = require('../../component/location-new/utils/dms-utils')

const Line = require('./line')
const Polygon = require('./polygon')
const PointRadius = require('./point-radius')
const BoundingBox = require('./bounding-box')
const Keyword = require('./keyword')
const plugin = require('plugins/location')

const readableNames = {
  lat: 'latitude',
  lon: 'longitude',
  west: 'longitude',
  east: 'longitude',
  north: 'latitude',
  south: 'latitude',
  dmsLat: 'latitude',
  dmsLon: 'longitude',
  dmsNorth: 'latitude',
  dmsSouth: 'latitude',
  dmsWest: 'longitude',
  dmsEast: 'longitude',
  lineWidth: 'buffer width',
}

const validLatLon = {
  lat: '90',
  lon: '180',
  west: '180',
  east: '180',
  north: '90',
  south: '90',
  dmsLat: '90°00\'00"',
  dmsLon: '180°00\'00"',
}

const inputs = plugin({
  line: {
    label: 'Line',
    Component: Line,
  },
  poly: {
    label: 'Polygon',
    Component: Polygon,
  },
  circle: {
    label: 'Point-Radius',
    Component: PointRadius,
  },
  bbox: {
    label: 'Bounding Box',
    Component: BoundingBox,
  },
  keyword: {
    label: 'Keyword',
    Component: ({ setState, keywordValue, ...props }) => {
      return (
        <Keyword
          {...props}
          value={keywordValue}
          setState={({ value, ...data }) => {
            setState({ keywordValue: value, ...data })
          }}
        />
      )
    },
  },
})

const drawTypes = ['line', 'poly', 'circle', 'bbox']

const Form = ({ children }) => (
  <div className="form-group clearfix">{children}</div>
)

const DrawButton = ({ onDraw }) => (
  <Button className="location-draw is-primary" onClick={onDraw}>
    <span className="fa fa-globe" />
    <span>Draw</span>
  </Button>
)

const Invalid = styled.div`
  background-color: ${props => props.theme.negativeColor};
  height: 100%;
  display: block;
  overflow: hidden;
  color: white;
`

const Root = styled.div`
  height: ${props => (props.isOpen ? 'auto' : props.theme.minimumButtonSize)};
`

const Component = CustomElements.registerReact('location')
const LocationInput = props => {
  const { mode, setState } = props
  const input = inputs[mode] || {}
  const { Component: Input = null } = input
  return (
    <Root isOpen={input.label !== undefined}>
      <Component>
        <Dropdown label={input.label || 'Select Location Option'}>
          <Menu value={mode} onChange={(mode) => setState('mode', mode)}>
            {Object.keys(inputs).map(key => (
              <MenuItem key={key} value={key}>
                {inputs[key].label}
              </MenuItem>
            ))}
          </Menu>
        </Dropdown>
        <Form>
          {Input !== null ? <Input {...props} /> : null}
          {drawTypes.includes(mode) ? (
            <DrawButton onDraw={props.onDraw} />
          ) : null}
        </Form>
      </Component>
    </Root>
  )
}

module.exports = ({ state, setState, options }) => (
  <LocationInput
    {...state}
    onDraw={options.onDraw}
    setState={setState}
    cursor={key => value => {
        setState(key, value, false)
      }}
  />
)
