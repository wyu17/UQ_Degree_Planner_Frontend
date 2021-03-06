import React from 'react';
import Section from './Section';
import sectionClass from '../classes/sectionClass';
import courseClass from '../classes/courseClass';
import yearClass from '../classes/yearClass';
import DegreeWrapper from './DegreeWrapper';
import Year from './Year';
import Course from './Course';
import "./styles/DisplayTimetable.css";

const Timetable = (props : any) => {
    const [displayDegrees, setDisplayDegrees] = React.useState([]);
    const [displayYears, setDisplayYears] = React.useState([]);
    console.log("timetableRerendered");

    const addCourse = (degrees : any, remCourse : any) => {
        for (let k = 0; k < degrees.length; k++) {
            if (degrees[k].code.toString() === remCourse.dcode) {
                degrees = addCourseToSections(degrees, k, 1, remCourse.dcode, remCourse.mcode, remCourse.name, remCourse.code, remCourse.title, 
                    remCourse.units, remCourse.sem1, remCourse.sem2, remCourse.sum, remCourse.prereq, remCourse.incomp);
                degrees = addCourseToSections(degrees, k, 2, remCourse.dcode, remCourse.mcode, remCourse.name, remCourse.code, 
                    remCourse.title, remCourse.units, remCourse.sem1, remCourse.sem2, remCourse.sum, remCourse.prereq, remCourse.incomp);
                degrees = addCourseToSections(degrees, k, 3, remCourse.dcode, remCourse.mcode, remCourse.name, remCourse.code, remCourse.title, remCourse.units, 
                    remCourse.sem1, remCourse.sem2, remCourse.sum, remCourse.prereq, remCourse.incomp);
            }
        }
        return degrees;
    }

    const spliceCourseFromSections = (degrees : any, index : number, type : number, mcode : string, name : string, code : string, units : number) => {
        let codes;
        if (type === 1) {
            codes = degrees[index].majorCodes;
        } else if (type === 2) {
            codes = degrees[index].minorCodes;
        } else if (type === 3) {
            codes = degrees[index].emajCodes;
        }
        for (let m = 0; m < codes.length; m++) {
            for (let i = 0; i < codes[m].sections.length; i++) {
                let section = codes[m].sections[i];
                if (section.mcode === mcode && section.name === name) {
                    let courses = section.courses;
                    for (let j = 0; j < courses.length; j++) {
                        let course = courses[j];
                        if (!course.optional) {
                            if (courses[j].code === code) {
                                courses.splice(j, 1);
                                degrees[index].currentUnits += units;
                                codes[m].currentUnits += units;
                                section.currentUnits += units;
                                return degrees;
                            }
                        } else {
                            let optionalCourses = course.course;
                            for (let z = 0; z < optionalCourses.length; z++) {
                                if (optionalCourses[z].code === code) {
                                    optionalCourses.splice(z, 1);
                                    degrees[index].currentUnits += units
                                    codes[m].currentUnits += units;
                                    section.currentUnits += units;
                                    return degrees;
                                }
                            }
                        }
                    }
                }
            }
        }
        return degrees;
    }

    const onDrop = (e : any, id : number, sem : any, code : string, dcode : string, mcode : string, name : string, units : number)  => {
        e.preventDefault();
        e.stopPropagation();
        let degrees : any = JSON.parse(JSON.stringify(props.user.degrees));
        for (let k = 0; k < degrees.length; k++) {
            if (degrees[k].code.toString() === dcode) {
                if (name === 'ELECTIVE') {
                    degrees[k].elective = "";
                    degrees[k].currentUnits += units;
                } else {
                    degrees = spliceCourseFromSections(degrees, k, 1, mcode, name, code, units);
                    degrees = spliceCourseFromSections(degrees, k, 2, mcode, name, code, units);
                    degrees = spliceCourseFromSections(degrees, k, 3, mcode, name, code, units);
                }
            }
        }
        let years : any = JSON.parse(JSON.stringify(props.user.years));
        outerLoop2:
        for (let i = 0; i < years.length; i++) {
            let year = years[i];
            if (year.id === id) {
                let semester;
                if (sem === "Semester One") {
                    semester = year.sem1;
                } else if (sem === "Semester Two") {
                    semester = year.sem2;
                } else {
                    semester = year.sum;
                }
                semester.push(new courseClass(e.dataTransfer.getData("dcode"), e.dataTransfer.getData("mcode"), e.dataTransfer.getData("name"), 
                e.dataTransfer.getData("code"), e.dataTransfer.getData("title"), e.dataTransfer.getData("units"),
                e.dataTransfer.getData("sem1"), e.dataTransfer.getData("sem2"), e.dataTransfer.getData("sum"),
                e.dataTransfer.getData("prereq"), e.dataTransfer.getData("incomp")));
                break outerLoop2;
            }
        }
        props.addToTimetable(props.user, degrees, years);
    }

    const onDragOver = (e : any) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragStart = (e : any, code : string, title : string, units : number, sem1 : boolean, sem2 : boolean, 
        sum : boolean, prereq : string, incomp: string, dcode : string, mcode: string, name : string) => {
        e.dataTransfer.setData("code", code);
        e.dataTransfer.setData("title", title);
        e.dataTransfer.setData("units", units);
        e.dataTransfer.setData("sem1", sem1);
        e.dataTransfer.setData("sem2", sem2);
        e.dataTransfer.setData("sum", sum);
        e.dataTransfer.setData("prereq", prereq);
        e.dataTransfer.setData("incomp", incomp);
        e.dataTransfer.setData("dcode", dcode);
        e.dataTransfer.setData("mcode", mcode);
        e.dataTransfer.setData("name", name);
    };

    const addCourseToSections = (degrees : any, index : number, type : number, dcode : string, mcode : string, name : string, code : string, title : string,
        units : number, sem1 : string, sem2 : string, sum : string, prereq : string, incomp : string) => {
        let codes;
        if (type === 1) {
            codes = degrees[index].majorCodes;
        } else if (type === 2) {
            codes = degrees[index].minorCodes;
        } else if (type === 3) {
            codes = degrees[index].emajCodes;
        }
        for (let m = 0; m < codes.length; m++) {
            for (let i = 0; i < codes[m].sections.length; i++) {
                let section = codes[m].sections[i];
                if (section.mcode === mcode && section.name === name) {
                    let courses = section.courses;
                    let courseSet = false;
                    for (let z = 0; z < courses.length; z++) {
                        if (courses[z].optional && courses[z].name.includes(code)) {
                            courses[z].course.push(new courseClass(dcode, mcode, name, code, title, units, sem1 === 'true', sem2  === 'true', sum  === 'true', 
                            prereq, incomp));
                            courseSet = true;
                        }
                    }
                    if (!courseSet) {
                        courses.push(new courseClass(dcode, mcode, name, code, title, units, sem1  === 'true', sem2  === 'true', sum  === 'true', prereq, incomp));
                    }
                    degrees[index].currentUnits -= units;
                    codes[m].currentUnits -= units;
                    section.currentUnits -= units;
                    return degrees;
                }
            }
        }
        return degrees;
    }

    const onClick = (id : number, sem : string, code : string, dcode : string, mcode : string, name : string,
        incomp : string, prereq : string, sem1 : string, sem2 : string, sum : string, title : string, units : number) => {
        let degrees : any = JSON.parse(JSON.stringify(props.user.degrees));
        for (let k = 0; k < degrees.length; k++) {
            if (degrees[k].code.toString() === dcode) {
                if (name === 'ELECTIVE') {
                    degrees[k].currentUnits -= units;
                } else {
                    degrees = addCourseToSections(degrees, k, 1, dcode, mcode, name, code, title, units, sem1, sem2, sum, prereq, incomp);
                    degrees = addCourseToSections(degrees, k, 2, dcode, mcode, name, code, title, units, sem1, sem2, sum, prereq, incomp);
                    degrees = addCourseToSections(degrees, k, 3, dcode, mcode, name, code, title, units, sem1, sem2, sum, prereq, incomp);
                }
            }
        }
        let years : any = JSON.parse(JSON.stringify(props.user.years));
        outerLoop2:
        for (let i = 0; i < years.length; i++) {
            let year = years[i];
            if (year.id === id) {
                let semester;
                if (sem === "Semester One") {
                    semester = year.sem1;
                } else if (sem === "Semester Two") {
                    semester = year.sem2;
                } else {
                    semester = year.sum;
                }
                for (let j = 0; j < semester.length; j++) {
                    if (semester[j].code === code) {
                        semester.splice(j, 1);
                        break outerLoop2;
                    }
                }
            }
        }
        props.addToTimetable(props.user, degrees, years);
    }

    const getSections = (degreeCode : string, majorIds : any) => {
        let promises : any = [];
        for (let i = 0; i < majorIds.length; i++) {
            promises.push(fetch('http://localhost:8080/sections?dcode=' + degreeCode + "&mcode=" + majorIds[i]));
        }
        return promises;
    }

    const getSectionCodes = (data : any, degreeCode : string) => {
        let promises : any = [];
        for (let i = 0; i < data.length; i++) {
            let sections = data[i].degrees;
            for (let j = 0; j < sections.length; j++) {
                promises.push(fetch('http://localhost:8080/sectionCodes?dcode=' + degreeCode + "&mcode=" + sections[j].code + "&name=" + sections[j].name));
            }
        }   
        return promises;
    }

    const setSectionDegree = async (num : number, degreeArray : any, degreeComponents : any) => {
        let degree = degreeArray[num];
        let degreeCode : string = degree.code.toString();
        let majorIds = [];
        let sectionData : any;
        for (let i = 0; i < degree.majorCodes.length; i++) {
            majorIds.push(degree.majorCodes[i].code);
        }
        for (let i = 0; i < degree.minorCodes.length; i++) {
            majorIds.push(degree.minorCodes[i].code);
        }
        for (let i = 0; i < degree.emajCodes.length; i++) {
            majorIds.push(degree.emajCodes[i].code);
        }
        const responses = await Promise.all(getSections(degreeCode, majorIds)
        );
        const data = await Promise.all(responses.map((response: any) => {
            return response.json();
        }));
        sectionData = data;
        const responses_1 = await Promise.all(getSectionCodes(data, degreeCode));
        const data_2 = await Promise.all(responses_1.map((response_1: any) => {
            return response_1.json();
        }));
        let count = 0;
        for (let i = 0; i < sectionData.length; i++) {
            let sections = sectionData[i].degrees;
            let degreeSection : any = [];
            for (let j = 0; j < sections.length; j++) {
                degreeSection.push(new sectionClass(degreeCode, sections[j].code, sections[j].name,
                    sections[j].max, sections[j].min, data_2[count]));
                count++;
            }
            for (let j = 0; j < degree.majorCodes.length; j++) {
                if (degree.majorCodes[j].code === majorIds[i]) {
                    degree.majorCodes[j].sections = degreeSection;
                }
            }
            for (let j = 0; j < degree.minorCodes.length; j++) {
                if (degree.minorCodes[j].code === majorIds[i]) {
                    degree.minorCodes[j].sections = degreeSection;
                }
            }
            for (let j = 0; j < degree.emajCodes.length; j++) {
                if (degree.emajCodes[j].code === majorIds[i]) {
                    degree.emajCodes[j].sections = degreeSection;
                }
            }
        }
        degreeComponents.push(<DegreeWrapper user = {props.user} dcode = {degreeCode} name = {degree.name} units = {degree.unit} degree = {degree}
             onDragStart = {onDragStart} electiveHandler = {handleElective}/>)
        if (num < props.user.degrees.length - 1) {
            setSectionDegree(num + 1, degreeArray, degreeComponents);
        } else {
            props.initDegrees(props.user, degreeArray);
            setDisplayDegrees(degreeComponents);
        }
    }
    
    const existingSections = (degrees : any) => {
        let newDegrees : any = [];
        for (let i = 0; i < degrees.length; i++) {
            let degree = degrees[i];
            newDegrees.push(<DegreeWrapper dcode = {degree.code} name = {degree.name} units = {degree.unit} degree = {degree}
                onDragStart = {onDragStart}
                user = {props.user} electiveHandler = {handleElective}/>);
        }
        return newDegrees;
    }


    const existingYears = (years : any) => {
        let newYears : any = [];
        for (let i = 0; i < years.length; i++) {
            let year = years[i];
            newYears.push(<Year id = {year.id} key = {year.id} onClick = {onClick} onDragOver = {onDragOver} onDrop = {onDrop} sem1 = {year.sem1} 
                sem2 = {year.sem2} sum = {year.sum} user = {props.user} finalYear = {year.finalYear} deleteYear = {deleteYear}/>);
        }
        return newYears;
    }

    const addYear = () => {
        let newYears = JSON.parse(JSON.stringify(props.user.years));
        let newId = newYears.length + 1
        newYears.push(new yearClass([], [], [], newId));
        if (newYears.length > 1) {
            newYears[newYears.length - 2].finalYear = false;
        }
        props.addToTimetable(props.user, props.user.degrees, newYears);
    }

    const deleteYear = () => {
        let newYears = JSON.parse(JSON.stringify(props.user.years));
        let lastYear = newYears[newYears.length -1];
        let degrees : any = JSON.parse(JSON.stringify(props.user.degrees));
        for (let z = 0; z < lastYear.sem1.length; z++) {
            let remCourse = lastYear.sem1[z];
            degrees = addCourse(degrees, remCourse);
        }
        for (let z = 0; z < lastYear.sem2.length; z++) {
            let remCourse = lastYear.sem2[z];
            degrees = addCourse(degrees, remCourse);
        }
        for (let z = 0; z < lastYear.sum.length; z++) {
            let remCourse = lastYear.sum[z];
            degrees = addCourse(degrees, remCourse);
        }
        newYears.splice(newYears.length -1, 1);
        if (newYears.length > 0) {
            newYears[newYears.length - 1].finalYear = true;
        }
        props.addToTimetable(props.user, degrees, newYears);
    }

    const handleElective = (dcode : string, curFormValue : string) => {
        let newDegrees = JSON.parse(JSON.stringify(props.user.degrees));
        for (let i = 0; i < newDegrees.length; i++) {
            if (newDegrees[i].code === dcode) {
                let degree = newDegrees[i];
                fetch('http://localhost:8080/course?code=' + curFormValue)
                .then(response => response.json())
                .then(data => {
                    if(data.length === 0) {
                        degree.elective = "This course could not be found";
                    } else {
                        degree.elective = new courseClass(dcode, "ELECTIVE", "ELECTIVE", data[0].code, data[0].title, data[0].units, data[0].sem1,
                            data[0].sem2, data[0].sum, data[0].prereq, data[0].incomp);
                    }
                    props.addToTimetable(props.user, newDegrees, props.user.years);
                });
            }
        }
    }
    
    React.useEffect(() => {
        if (!props.user.sectionsSelected) {
            let newDegrees : any = JSON.parse(JSON.stringify(props.user.degrees));
            setSectionDegree(0, newDegrees, []);
        }
    }, []);

    React.useEffect(() => {
        let newDegrees = existingSections(props.user.degrees);
        let newYears = existingYears(props.user.years);
        setDisplayDegrees(newDegrees);
        setDisplayYears(newYears);
        console.log(props.user)
    }, [props.user]);

    return (
        <div className = "sectionContainer">
            <div className = "sections">
                {displayDegrees}
            </div>
            <div className = 'sem-drop-zone'>
                <button onClick = {addYear} className = "addYearButton">
                    Add Additional Year
                </button>
                {displayYears}
            </div>
        </div>
    )
}

export default Timetable;