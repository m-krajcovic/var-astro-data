import React, {Component, Fragment} from "react";
import {
    CoordinatesFormItem,
    CrossIdsFormItem,
    IdNameSelectFormItem, NumberFormItem, TextAreaFormItem,
    TypeFormItem
} from "../common/FormItems";

export class CzevStarDraftSingleStarFormItems extends Component {
    render() {
        const currentYear = new Date().getFullYear();
        return (
            <Fragment>
                <CoordinatesFormItem form={this.props.form} required={true}/>
                <CrossIdsFormItem form={this.props.form} onCrossIdBlur={this.props.onCrossIdBlur}
                                  onCrossIdSearch={this.props.onCrossIdSearch}/>
                <IdNameSelectFormItem
                    form={this.props.form}
                    field="constellation"
                    label="Constellation"
                    placeholder="Select a constellation"
                    loading={this.props.entities.loading}
                    required={true}
                    options={this.props.entities.constellations}
                    optionName={(cons) => `${cons.abbreviation} (${cons.name})`}/>
                <IdNameSelectFormItem
                    form={this.props.form}
                    label="Discoverers"
                    field="discoverers"
                    mode="multiple"
                    placeholder="Select discoverer(s)"
                    required={true}
                    options={this.props.entities.observers}
                    optionName={o => `${o.firstName} ${o.lastName}`}
                    loading={this.props.entities.loading}/>
                <NumberFormItem form={this.props.form} label="Year" required={true} field="year" max={currentYear} initialValue={currentYear}/>
                <TypeFormItem form={this.props.form} types={this.props.entities.types}/>
                <NumberFormItem form={this.props.form} label="Amplitude" field="amplitude"/>
                <IdNameSelectFormItem
                    label="Filter Band"
                    field="filterBand"
                    placeholder="Select a filter band"
                    form={this.props.form}
                    options={this.props.entities.filterBands}
                    loading={this.props.entities.loading}/>
                <NumberFormItem form={this.props.form} label="Epoch" field="epoch" min={2400000}/>
                <NumberFormItem form={this.props.form} label="Period" field="period"/>
                <TextAreaFormItem form={this.props.form} label="Note" field="note"/>
                <NumberFormItem form={this.props.form} label="J Magnitude" field="jmagnitude"/>
                <NumberFormItem form={this.props.form} label="V Magnitude" field="vmagnitude"/>
                <NumberFormItem form={this.props.form} label="K Magnitude" field="kmagnitude"/>
            </Fragment>
        )
    }
}
