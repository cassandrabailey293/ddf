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

const Group = require('../group')
const Label = require('./label')
const TextField = require('../text-field')
const { Radio, RadioItem } = require('../radio')

const { Zone, Hemisphere, MinimumSpacing } = require('./common')

const {
  DmsLatitude,
  DmsLongitude,
} = require('../../component/location-new/geo-components/coordinates.js')
const DirectionInput = require('../../component/location-new/geo-components/direction.js')
const { Direction } = require('../../component/location-new/utils/dms-utils.js')
import { locationInputValidators, getLocationInputError, Invalid, WarningIcon } from '../utils/validation'

const minimumDifference = 0.0001

const BoundingBoxLatLon = props => {
  const [latlonState, setLatLonState] = useState({ error: false, errorMsg: '', defaultValue: '' });
  const { north, east, south, west, setState } = props

  const { mapEast, mapWest, mapSouth, mapNorth } = props

  const westMax = parseFloat(mapEast) - minimumDifference
  const eastMin = parseFloat(mapWest) + minimumDifference
  const northMin = parseFloat(mapSouth) + minimumDifference
  const southMax = parseFloat(mapNorth) - minimumDifference
  function onChangeLatLon(key, value) {
    let { errorMsg, defaultCoord } = getLocationInputError(key, value)
    setLatLonState({ error: !locationInputValidators[key](value), errorMsg: errorMsg, defaultValue: defaultCoord || ''})
    if(defaultCoord && defaultCoord.length != 0) {
      value = defaultCoord
    }
    setState(key, value)
  }
  function onBlurLatLon(key, value) {
    let { errorMsg, defaultCoord } = getLocationInputError(key, value)
    setLatLonState({ error: value.length == 0, errorMsg: errorMsg, defaultValue: defaultCoord})
  }
  return (
    <div className="input-location">
      <TextField
        label="West"
        value={west}
        onChange={(west) => onChangeLatLon('west', west)}
        onBlur={() => onBlurLatLon('west', west)}
        type="number"
        step="any"
        min={-180}
        max={westMax || 180}
        addon="°"
      />
      <TextField
        label="South"
        value={south}
        onChange={(south) => onChangeLatLon('south', south)}
        onBlur={() => onBlurLatLon('south', south)}
        type="number"
        step="any"
        min={-90}
        max={southMax || 90}
        addon="°"
      />
      <TextField
        label="East"
        value={east}
        onChange={(east) => onChangeLatLon('east', east)}
        onBlur={() => onBlurLatLon('east', east)}
        type="number"
        step="any"
        min={eastMin || -180}
        max={180}
        addon="°"
      />
      <TextField
        label="North"
        value={north}
        onChange={(north) => onChangeLatLon('north', north)}
        onBlur={() => onBlurLatLon('north', north)}
        type="number"
        step="any"
        min={northMin || -90}
        max={90}
        addon="°"
      />
      {latlonState.error ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
      <span>{latlonState.errorMsg}</span>
        </Invalid>
      ) : null}
    </div>
  )
}

const BoundingBoxUsngMgrs = props => {
  const { usngbbUpperLeft, usngbbLowerRight, cursor } = props
  return (
    <div className="input-location">
      <TextField
        label="Upper Left"
        style={{ minWidth: 200 }}
        value={usngbbUpperLeft}
        onChange={cursor('usngbbUpperLeft')}
      />
      <TextField
        label="Lower Right"
        style={{ minWidth: 200 }}
        value={usngbbLowerRight}
        onChange={cursor('usngbbLowerRight')}
      />
    </div>
  )
}

const BoundingBoxUtmUps = props => {
  const {
    utmUpsUpperLeftEasting,
    utmUpsUpperLeftNorthing,
    utmUpsUpperLeftZone,
    utmUpsUpperLeftHemisphere,

    utmUpsLowerRightEasting,
    utmUpsLowerRightNorthing,
    utmUpsLowerRightZone,
    utmUpsLowerRightHemisphere,

    cursor,
  } = props

  return (
    <div>
      <div className="input-location">
        <Group>
          <Label>Upper-Left</Label>
          <div>
            <TextField
              label="Easting"
              value={utmUpsUpperLeftEasting}
              onChange={cursor('utmUpsUpperLeftEasting')}
              addon="m"
            />
            <TextField
              label="Northing"
              value={utmUpsUpperLeftNorthing}
              onChange={cursor('utmUpsUpperLeftNorthing')}
              addon="m"
            />
            <Zone
              value={utmUpsUpperLeftZone}
              onChange={cursor('utmUpsUpperLeftZone')}
            />
            <Hemisphere
              value={utmUpsUpperLeftHemisphere}
              onChange={cursor('utmUpsUpperLeftHemisphere')}
            />
          </div>
        </Group>
      </div>
      <div className="input-location">
        <Group>
          <Label>Lower-Right</Label>
          <div>
            <TextField
              label="Easting"
              value={utmUpsLowerRightEasting}
              onChange={cursor('utmUpsLowerRightEasting')}
              addon="m"
            />
            <TextField
              label="Northing"
              value={utmUpsLowerRightNorthing}
              onChange={cursor('utmUpsLowerRightNorthing')}
              addon="m"
            />
            <Zone
              value={utmUpsLowerRightZone}
              onChange={cursor('utmUpsLowerRightZone')}
            />
            <Hemisphere
              value={utmUpsLowerRightHemisphere}
              onChange={cursor('utmUpsLowerRightHemisphere')}
            />
          </div>
        </Group>
      </div>
    </div>
  )
}

const BoundingBoxDms = props => {
  const [latlonState, setLatLonState] = useState({ error: false, errorMsg: '', defaultValue: '' });
  const {
    dmsSouth,
    dmsNorth,
    dmsWest,
    dmsEast,

    dmsSouthDirection,
    dmsNorthDirection,
    dmsWestDirection,
    dmsEastDirection,

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
  return (
    <div className="input-location">
      <DmsLongitude label="West" value={dmsWest} onChange={(dmsWest, type) => onChangeLatLon('dmsWest', dmsWest, type)}>
        <DirectionInput
          options={longitudeDirections}
          value={dmsWestDirection}
          onChange={(dmsWestDirection) => setState('dmsWestDirection', dmsWestDirection)}
        />
      </DmsLongitude>
      <DmsLatitude label="South" value={dmsSouth} onChange={(dmsSouth, type) => onChangeLatLon('dmsSouth', dmsSouth, type)}>
        <DirectionInput
          options={latitudeDirections}
          value={dmsSouthDirection}
          onChange={(dmsSouthDirection) => setState('dmsSouthDirection', dmsSouthDirection)}
        />
      </DmsLatitude>
      <DmsLongitude label="East" value={dmsEast} onChange={(dmsEast, type) => onChangeLatLon('dmsEast', dmsEast, type)}>
        <DirectionInput
          options={longitudeDirections}
          value={dmsEastDirection}
          onChange={(dmsEastDirection) => setState('dmsEastDirection', dmsEastDirection)}
        />
      </DmsLongitude>
      <DmsLatitude label="North" value={dmsNorth} onChange={(dmsNorth, type) => onChangeLatLon('dmsNorth', dmsNorth, type)}>
        <DirectionInput
          options={latitudeDirections}
          value={dmsNorthDirection}
          onChange={(dmsNorthDirection) => setState('dmsNorthDirection', dmsNorthDirection)}
        />
      </DmsLatitude>
      {latlonState.error ? (
        <Invalid>
          <WarningIcon className="fa fa-warning" />
      <span>{latlonState.errorMsg}</span>
        </Invalid>
      ) : null}
    </div>
  )
}

const BoundingBox = props => {
  const { cursor, locationType } = props

  const inputs = {
    latlon: BoundingBoxLatLon,
    usng: BoundingBoxUsngMgrs,
    utmUps: BoundingBoxUtmUps,
    dms: BoundingBoxDms,
  }

  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio value={locationType} onChange={cursor('locationType')}>
        <RadioItem value="latlon">Lat/Lon (DD)</RadioItem>
        <RadioItem value="dms">Lat/Lon (DMS)</RadioItem>
        <RadioItem value="usng">USNG / MGRS</RadioItem>
        <RadioItem value="utmUps">UTM / UPS</RadioItem>
      </Radio>
      <MinimumSpacing />
      {Component !== null ? <Component {...props} /> : null}
    </div>
  )
}

module.exports = BoundingBox
