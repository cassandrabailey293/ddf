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

import { InvalidSearchFormMessage } from '../../../component/announcement/CommonMessages'
import styled from 'styled-components'
const announcement = require('../../../component/announcement/index.jsx')
const {
  validateInput,
} = require('../../../component/location-new/utils/dms-utils')
export function showErrorMessages(errors: any) {
  if (errors.length === 0) {
    return
  }
  let searchErrorMessage = JSON.parse(JSON.stringify(InvalidSearchFormMessage))
  if (errors.length > 1) {
    let msg = searchErrorMessage.message
    searchErrorMessage.title =
      'Your search cannot be run due to multiple errors'
    const formattedErrors = errors.map(
      (error: any) => `\u2022 ${error.title}: ${error.body}`
    )
    searchErrorMessage.message = msg.concat(formattedErrors)
  } else {
    const error = errors[0]
    searchErrorMessage.title = error.title
    searchErrorMessage.message = error.body
  }
  announcement.announce(searchErrorMessage)
}

export function getFilterErrors(filters: any) {
  const errors = new Set()
  let geometryErrors = new Set<string>()
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]
    getGeometryErrors(filter).forEach(function(msg) {
      geometryErrors.add(msg)
    })
  }
  geometryErrors.forEach(function(err) {
    errors.add({
      title: 'Invalid geometry filter',
      body: err
    })
  })
  return Array.from(errors)
}

function getGeometryErrors(filter: any):Set<string> {
    const geometry = filter.geojson && filter.geojson.geometry
    const errors = new Set<string>()
    if(!geometry) {
      return errors
    }
    switch(filter.geojson.properties.type) {
      case 'Polygon':
        if(geometry.coordinates[0].length < 4) {
          errors.add('Polygon coordinates must be in the form [[x,y],[x,y],[x,y],[x,y], ... ]')
        }
        break;
      case 'LineString':
        if(geometry.coordinates.length < 2) {
          errors.add('Line coordinates must be in the form [[x,y],[x,y], ... ]')
        }
        if(!filter.distance || filter.distance == 0) {
          errors.add('Line buffer width must be greater than 0.000001')
        }
        break;
      case 'Point':
        if(!filter.distance || filter.distance < 0.000001) {
          errors.add('Radius must be greater than 0.000001')
        }
        if(geometry.coordinates.some((coord: any) => !coord || coord.toString().length == 0)) {
          errors.add('Coordinates must not be empty')
        }
        break;
      case 'BoundingBox':
        const box = filter.geojson.properties
        if(!box.east || !box.west || !box.north || !box.south) {
          errors.add('Bounding Box must have valid values')
        }
        break;
    }
    return errors
}

export const locationInputValidators: {[key: string]: (value: string) => boolean} = {
  lat: (value: string) => Number(value) <= 90 && Number(value) >= -90,
  lon: (value: string) => Number(value) <= 180 && Number(value) >= -180,
  dmsLat: (value: string) => validateInput(value, 'dd°mm\'ss.s"') == value,
  dmsLon: (value: string) => validateInput(value, 'ddd°mm\'ss.s"') == value,
  radius: (value: string | number) => value >= 0.000001,
  lineWidth: (value: string | number) => value >= 0.000001,
}

export function getLocationInputError(key: string, value: string):{errorMsg:string, defaultCoord?:number} {
  let errorMsg: string = ''
  let defaultCoord;
  console.log(">>>>>", locationInputValidators)
  console.log(">>>>>", locationInputValidators[key])
  if (key === 'radius') {
    errorMsg = ' Radius cannot be empty or less than 0.00001.  '
  } else if (value.length === 0) {
    errorMsg = ' ' + readableNames[key].replace(/^\w/, c => c.toUpperCase()) + ' cannot be empty.  '
  } else if (!locationInputValidators[key](value)) {
    defaultCoord = getValidLatLon(key, value)
    value = value.replace(/_/g, '0')
    errorMsg = 
      value +
      ' is not an acceptable ' +
      readableNames[key] +
      ' value. Defaulting to ' +
      defaultCoord +
      '.  '
  }
  return { errorMsg, defaultCoord }
}

const readableNames: {[key: string]: string} = {
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

const validLatLon: {[key:string]: string} = {
  lat: '90',
  lon: '180',
  west: '180',
  east: '180',
  north: '90',
  south: '90',
  dmsLat: '90°00\'00"',
  dmsLon: '180°00\'00"',
}

const getValidLatLon = (key:string, value:string) => {
  // TODO: change equals
  if (key == 'dmsLat') {
    return validateInput(value, 'dd°mm\'ss.s"')
  } else if (key == 'dmsLon') {
    return validateInput(value, 'ddd°mm\'ss.s"')
  } else {
    if (Number(value) < 0) {
      return -1 * Number(validLatLon[key])
    } else {
      return Number(validLatLon[key])
    }
  }
  
}

export const Invalid = styled.div`
  background-color: ${props => props.theme.negativeColor};
  height: 100%;
  display: block;
  overflow: hidden;
  color: white;
`

export const WarningIcon = styled.span`
  padding: ${({ theme }) => theme.minimumSpacing};
`
