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
import React, { useState } from 'react'
const { Radio, RadioItem } = require('../radio')
const TextField = require('../text-field')
import { locationInputValidators, getLocationInputError, Invalid, WarningIcon } from '../utils/validation'
const { Units, Zone, Hemisphere, MinimumSpacing } = require('./common')

const {
  DmsLatitude,
  DmsLongitude,
} = require('../../component/location-new/geo-components/coordinates.js')
const DirectionInput = require('../../component/location-new/geo-components/direction.js')
const { Direction } = require('../../component/location-new/utils/dms-utils.js')

const PointRadiusLatLon = props => {
  const [latlonState, setLatLonState] = useState({ error: false, errorMsg: '', defaultValue: '' });
  const [radiusError, setRadiusError] = useState(false);
  const { lat, lon, radius, radiusUnits, setState } = props
  function onChangeLatLon(key, value) {
    let { errorMsg, defaultCoord } = getLocationInputError(key, value)
    setLatLonState({ error: !locationInputValidators[key](value), errorMsg: errorMsg, defaultValue: defaultCoord || ''})
    if(defaultCoord && defaultCoord.length != 0) {
      value = defaultCoord
    }
    setState(key, value)
  }
  function onBlurLatLon(key, value) {
    props.callback
    let { errorMsg, defaultCoord } = getLocationInputError(key, value)
    setLatLonState({ error: value.length == 0, errorMsg: errorMsg, defaultValue: defaultCoord})
  }
  function onChangeRadius(value) {
    setRadiusError(!locationInputValidators['radius'](value))
    setState('radius', value)
  }
  return (
    <div>
      <TextField
        type="number"
        label="Latitude"
        value={lat}
        onChange={(lat) => onChangeLatLon('lat', lat)}
        onBlur={() => onBlurLatLon('lat', lat)}
        addon="°"
      />
      <TextField
        type="number"
        label="Longitude"
        value={lon}
        onChange={(lon) => onChangeLatLon('lon', lon)}
        onBlur={() => onBlurLatLon('lon', lon)}
        addon="°"
      />
      {latlonState.error ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span>{latlonState.errorMsg}</span>
        </Invalid>
      ) : null}
      <Units value={radiusUnits} onChange={(radiusUnits) => setState('radiusUnits', radiusUnits, (errors = false))}>
        <TextField
          type="number"
          min="0"
          label="Radius"
          value={radius}
          onChange={(radius) => onChangeRadius(radius)}
        />
      </Units>
      {radiusError ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span> Radius cannot be empty or less than 0.00001. </span>
        </Invalid>
      ) : null}
    </div>
  )
}

const usngs = require('usng.js')
const converter = new usngs.Converter()

const PointRadiusUsngMgrs = props => {
  const [error, setError] = useState(false);
  const [radiusError, setRadiusError] = useState(false);
  const { usng, radius, radiusUnits, setState } = props
  function testValidity(usng) {
    try {
      const result = converter.USNGtoLL(usng, true)
      setError(Number.isNaN(result.lat) || Number.isNaN(result.lon))
    } catch (err) {
      setError(true)
    }
  }
  function onChangeRadius(value) {
    setRadiusError(!locationInputValidators['radius'](value))
    setState('radius', value)
  }
  return (
    <div>
      <TextField label="USNG / MGRS" value={usng} onChange={(usng) => setState('usng', usng)} onBlur={() => testValidity(usng)} />
      {error ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span>Invalid USNG / MGRS coords</span>
        </Invalid>
      ) : null}
      <Units value={radiusUnits} onChange={(radiusUnits) => setState('radiusUnits', radiusUnits, (errors = false))}>
        <TextField label="Radius" value={radius} onChange={(radius) => onChangeRadius(radius)} />
      </Units>
      {radiusError ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span> Radius cannot be empty or less than 0.00001. </span>
        </Invalid>
      ) : null}
    </div>
  )
}

const PointRadiusUtmUps = props => {
  const {
    utmUpsEasting,
    utmUpsNorthing,
    utmUpsZone,
    utmUpsHemisphere,
    radius,
    radiusUnits,
    cursor,
  } = props
  return (
    <div>
      <TextField
        label="Easting"
        value={utmUpsEasting}
        onChange={cursor('utmUpsEasting')}
        addon="m"
      />
      <TextField
        label="Northing"
        value={utmUpsNorthing}
        onChange={cursor('utmUpsNorthing')}
        addon="m"
      />
      <Zone value={utmUpsZone} onChange={cursor('utmUpsZone')} />
      <Hemisphere
        value={utmUpsHemisphere}
        onChange={cursor('utmUpsHemisphere')}
      />
      <Units value={radiusUnits} onChange={cursor('radiusUnits')}>
        <TextField label="Radius" value={radius} onChange={cursor('radius')} />
      </Units>
    </div>
  )
}

const PointRadiusDms = props => {
  const [latlonState, setLatLonState] = useState({ error: false, errorMsg: '', defaultValue: '' });
  const [radiusError, setRadiusError] = useState(false);
  const {
    dmsLat,
    dmsLon,
    dmsLatDirection,
    dmsLonDirection,
    radius,
    radiusUnits,
    setState,
  } = props
  const latitudeDirections = [Direction.North, Direction.South]
  const longitudeDirections = [Direction.East, Direction.West]
  function onChangeLatLon(key, value, type) {
    let { errorMsg, defaultCoord } = getLocationInputError(key, value)
    setLatLonState({ error: type == 'blur' ? value.length == 0 : !locationInputValidators[key](value), errorMsg: errorMsg, defaultValue: defaultCoord || ''})
    if(defaultCoord && defaultCoord.length != 0) {
      value = defaultCoord
    }
    setState(key, value)
  }
  function onChangeRadius(value) {
    setRadiusError(!locationInputValidators['radius'](value))
    setState('radius', value)
  }
  return (
    <div>
      <DmsLatitude 
        label="Latitude" 
        value={dmsLat} 
        onChange={(dmsLat, type) => onChangeLatLon('dmsLat', dmsLat, type)}>
        <DirectionInput
          options={latitudeDirections}
          value={dmsLatDirection}
          onChange={(dmsLat) => setState('dmsLatDirection', dmsLatDirection, (errors = false))}
        />
      </DmsLatitude>
      <DmsLongitude
        label="Longitude"
        value={dmsLon}
        onChange={(dmsLon, type) => onChangeLatLon('dmsLon', dmsLon, type)}>
        <DirectionInput
          options={longitudeDirections}
          value={dmsLonDirection}
          onChange={(dmsLon) => setState('dmsLonDirection', dmsLonDirection, (errors = false))}
        />
      </DmsLongitude>
      {latlonState.error ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span>{latlonState.errorMsg}</span>
        </Invalid>
      ) : null}
      <Units value={radiusUnits} onChange={(radiusUnits) => setState('radiusUnits', radiusUnits, (errors = false))}>
        <TextField
          label="Radius"
          type="number"
          value={radius}
          onChange={(radius) => onChangeRadius(radius)}
        />
      </Units>
      {radiusError ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
          <span> Radius cannot be empty or less than 0.00001. </span>
        </Invalid>
      ) : null}
    </div>
  )
}

const PointRadius = props => {
  const { setState, locationType } = props

  const inputs = {
    latlon: PointRadiusLatLon,
    dms: PointRadiusDms,
    usng: PointRadiusUsngMgrs,
    utmUps: PointRadiusUtmUps,
  }

  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio value={locationType} onChange={(locationType) => setState('locationType', locationType)}>
        <RadioItem value="latlon">Lat / Lon (DD)</RadioItem>
        <RadioItem value="dms">Lat / Lon (DMS)</RadioItem>
        <RadioItem value="usng">USNG / MGRS</RadioItem>
        <RadioItem value="utmUps">UTM / UPS</RadioItem>
      </Radio>
      <MinimumSpacing />
      <div className="input-location">
        {Component !== null ? <Component {...props} /> : null}
      </div>
    </div>
  )
}

module.exports = PointRadius
