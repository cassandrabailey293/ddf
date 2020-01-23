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
const announcement = require('../../../component/announcement/index.jsx')

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
  const errors: any[] = []
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]
    const geometryErrors = getGeometryErrors(filter)
    geometryErrors.forEach(function(err) {
      errors.push({
        title: 'Invalid geometry filter',
        body: err
      })
    })
  }
  return errors
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
        break;
      case 'Point':
        if(!filter.distance || filter.distance < 0.000001) {
          errors.add('Radius must be greater than 0.00001')
        }
        errors.add('must be greater than 0.00001')

        break;
      case 'BoundingBox':
        const box = filter.geojson.properties
        if(!box.east || !box.west || !box.north || !box.south) {
          errors.add('Bounding Box must have North, South, East, and West values.')
        }
        break;
    }
    return errors
}
