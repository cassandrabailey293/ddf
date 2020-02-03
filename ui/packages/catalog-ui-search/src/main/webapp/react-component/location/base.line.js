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
import React, { useState, useEffect } from 'react'
import { Invalid, WarningIcon } from '../utils/validation'
const { Units } = require('./common')
const TextField = require('../text-field')

const coordinatePairRegex = /-?\d{1,3}(\.\d*)?\s-?\d{1,3}(\.\d*)?/g

function buildWktString(coordinates) {
  return '[[' + coordinates.join('],[') + ']]'
}

function convertWktString(value) {
  if (value.includes('MULTI')) {
    return convertMultiWkt(value.includes('POLYGON'), value)
  } else if (value.includes('POLYGON') && value.endsWith('))')) {
    return convertWkt(value, 4)
  } else if (value.includes('LINESTRING') && value.endsWith(')')) {
    return convertWkt(value, 2)
  }
  return value
}

function convertWkt(value, numCoords) {
  const coordinatePairs = value.match(coordinatePairRegex)
  if (!coordinatePairs || coordinatePairs.length < numCoords) {
    return value
  }
  const coordinates = coordinatePairs.map(coord => coord.replace(' ', ','))
  return buildWktString(coordinates)
}

function convertMultiWkt(isPolygon, value) {
  if (isPolygon && !value.endsWith(')))')) {
    return value
  } else if (!value.endsWith('))')) {
    return value
  }
  const splitter = isPolygon ? '))' : ')'
  const numPoints = isPolygon ? 4 : 2
  let shapes = value
    .split(splitter)
    .map(shape => shape.match(coordinatePairRegex))
  shapes = shapes
    .filter(shape => shape !== null && shape.length >= numPoints)
    .map(shape =>
      shape.map(coordinatePair => coordinatePair.replace(' ', ','))
    )
  return shapes.length === 0
    ? value
    : shapes.length === 1
      ? this.buildWktString(shapes[0])
      : '[' +
        shapes.map(shapeCoords => this.buildWktString(shapeCoords)) +
        ']'
}

function is2DArray(coordinates) {
  try {
    const parsedCoords = JSON.parse(coordinates)
    return Array.isArray(parsedCoords) && Array.isArray(parsedCoords[0])
  } catch (e) {
    return false
  }
}

function validatePoint(point) {
  if (
    point.length !== 2 ||
     (Number.isNaN(Number.parseFloat(point[0])) &&
      Number.isNaN(Number.parseFloat(point[1])))
  ) {
    return JSON.stringify(point) + ' is not a valid point.'
  } else if (
    point[0] > 180 ||
    point[0] < -180 ||
    point[1] > 90 ||
    point[1] < -90
  ) {
    return JSON.stringify(point) + ' is not a valid point.'
  }
  return ''
}

const BaseLine = props => {
  const { label, cursor, geometryKey, setState, unitKey, widthKey, mode  } = props
  const [currentValue, setCurrentValue] = useState(JSON.stringify(props[geometryKey]))
  const [errorMessage, setErrorMessage] = useState()

  /*
  componentWillReceiveProps(props) {
    if (document.activeElement !== this.ref) {
      const { geometryKey } = props
      const value = JSON.stringify(props[geometryKey])
      this.setState({ value })
    }
  } */

  useEffect(() => {
    setCurrentValue(currentValue)
  })

  function validateListOfPoints(coordinates) {
    let message = ''
    const isLine = mode.includes('line')
    const numPoints = isLine ? 2 : 4
    if (
      !mode.includes('multi') &&
      !coordinates.some(coords => coords.length > 2) &&
      coordinates.length < numPoints
    ) {
      message = `Minimum of ${numPoints} points needed for ${
        isLine ? 'Line' : 'Polygon'
      }`
    }
    coordinates.forEach(coordinate => {
      if (coordinate.length > 2) {
        coordinate.forEach(coord => {
          if (validatePoint(coord)) {
            message = validatePoint(coord)
          }
        })
      } else {
        if (mode.includes('multi')) {
          message = `Switch to ${isLine ? 'Line' : 'Polygon'}`
        } else if (validatePoint(coordinate)) {
          message = validatePoint(coordinate)
        }
      }
    })
    return message
  }

  function testValidity(currentValue) {
    if (!is2DArray(currentValue)) {
      return 'Not an acceptable value'
    }
    try {
      return validateListOfPoints(JSON.parse(currentValue))
    } catch (e) {
      //do nothing
    }
  }

  return (
    <React.Fragment>
      <div className="input-location">
        <TextField
          label={label}
          value={currentValue}
          onChange={value => {
            value = convertWktString(value.trim())
            setCurrentValue(value)
            try {
              //handle case where user clears input; JSON.parse('') would throw an error and maintain previous state
              if (value === '') {
                setState(geometryKey, undefined)
              } else {
                setState(geometryKey, JSON.parse(value))
              }
            } catch (e) {
              // do nothing
            }
          }}
          onBlur={() => setErrorMessage(testValidity(currentValue))}
        />
        {errorMessage ? (
          <Invalid>
            <WarningIcon className="fa fa-warning" />
            <span>{ errorMessage }</span>
          </Invalid>
        ) : null}
        <Units value={props[unitKey]} onChange={cursor(unitKey)}>
          <TextField
            type="number"
            label="Buffer width"
            value={String(props[widthKey])}
            onChange={cursor(widthKey)}
          />
        </Units>
      </div>
    </React.Fragment>
  )
}

module.exports = BaseLine