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
let errors = false
let errorMsg = ''
let inValidInput = ''
let inValidKey = ''
let defaultCoord = ''
const LocationInput = props => {
  const { mode, setState, cursor } = props
  const input = inputs[mode] || {}
  const { Component: Input = null } = input
  const removeErrorBox = () => {
    setState((errors = false))
  }
  return (
    <Root isOpen={input.label !== undefined}>
      <Component>
        <Dropdown label={input.label || 'Select Location Option'}>
          <Menu value={mode} onChange={cursor('mode')}>
            {Object.keys(inputs).map(key => (
              <MenuItem key={key} value={key}>
                {inputs[key].label}
              </MenuItem>
            ))}
          </Menu>
        </Dropdown>
        <Form>
          {Input !== null ? <Input {...props} /> : null}
          {errors ? (
            <Invalid>
              &nbsp;
              <span className="fa fa-exclamation-triangle" />
              {errorMsg}
              <span className="fa fa-times" onClick={removeErrorBox} />
            </Invalid>
          ) : (
            ''
          )}
          {drawTypes.includes(mode) ? (
            <DrawButton onDraw={props.onDraw} />
          ) : null}
        </Form>
      </Component>
    </Root>
  )
}

const ddValidators = {
  lat: value => value <= 90 && value >= -90 && value.length != 0,
  lon: value => value <= 180 && value >= -180 && value.length != 0,
  north: value => value <= 90 && value >= -90 && value.length != 0,
  west: value => value <= 180 && value >= -180 && value.length != 0,
  south: value => value <= 90 && value >= -90 && value.length != 0,
  east: value => value <= 180 && value >= -180 && value.length != 0,
  radius: value => value >= 0.000001,
}

let isDms = false
const dmsValidators = {
  dmsLat: value => validateInput(value, 'dd°mm\'ss.s"'),
  dmsLon: value => validateInput(value, 'ddd°mm\'ss.s"'),
  dmsNorth: value => validateInput(value, 'dd°mm\'ss.s"'),
  dmsSouth: value => validateInput(value, 'dd°mm\'ss.s"'),
  dmsWest: value => validateInput(value, 'ddd°mm\'ss.s"'),
  dmsEast: value => validateInput(value, 'ddd°mm\'ss.s"'),
}

const getNegOrPosLatLon = (key, value) => {
  if (value < 0) {
    return -1 * validLatLon[key]
  } else {
    return validLatLon[key]
  }
}

module.exports = ({ state, setState, options }) => (
  <LocationInput
    {...state}
    onDraw={options.onDraw}
    setState={setState}
    cursor={key => value => {
      debugger
      isDms = false
      let coordValidator = ddValidators[key]
      if (coordValidator === undefined) {
        coordValidator = dmsValidators[key]
        isDms = true
      }
      if (!isDms) {
        if (typeof coordValidator === 'function' && !coordValidator(value)) {
          debugger
          errors = true
          inValidInput = value
          inValidKey = readableNames[key]
          defaultCoord = getNegOrPosLatLon(key, value)
          if (key === 'radius') {
            errorMsg = ' Radius cannot be empty or less than 0.00001.  '
          } else if (value.length === 0) {
            errorMsg = ' ' + inValidKey.replace(/^\w/, c => c.toUpperCase()) + ' cannot be empty.  '
          } else {
            errorMsg =
              ' ' +
              inValidInput +
              ' is not an acceptable ' +
              inValidKey +
              ' value. Defaulting to ' +
              defaultCoord +
              '.  '
            value = defaultCoord
          }
          setState(key, value)
          return
        }
        setState(key, value, (errors = false))
      } else {
        if (
          typeof coordValidator === 'function' &&
          coordValidator(value) !== value &&
          value !== ''
        ) {
          errors = true
          inValidInput = value
          inValidKey = readableNames[key]
          defaultCoord = coordValidator(value)
          value = defaultCoord
          setState(key, value)
          return
        }
        setState(key, value, (errors = false))
      }
    }}
  />
)
