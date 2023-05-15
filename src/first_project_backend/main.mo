import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Random "mo:base/Random";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";

actor HomeworkDiary {

    type Homework = {
        title : Text;
        description : Text;
        dueDate : Time.Time;
        weight: Nat;
        completed : Bool;
    };

    type HomeworkWithId = {
        homeworkId : Nat;
        title : Text;
        description : Text;
        dueDate : Time.Time;
        weight: Nat;
        completed : Bool;
    };

    type MapperHomework = {
        homeworkId : Nat;
        weight : Nat;
    };

    type GroupHomework = {
        homeworkIds : [Nat];
        totalWeight : Nat;
    };

    type StudentName = Text;
    type Student = {
        name : StudentName;
        totalWeight: Nat;
        homeworkIds : [Nat];
    };

    type StudentHomework = {
        name: StudentName;
        homeworks: [HomeworkWithId];
    };

    type UpdateHomework = {
        homeworkId: Nat;
        data: Homework;
    };

    var title : Text = "MOTOKO BOOTCAMP 2023 HOMEWORK DIARY";
    var isAssignedHomework : Bool = false;
    let poolHomeworkDiary = Buffer.Buffer<Homework>(0);
    let students = Buffer.Buffer<Student>(0);
    
    public shared query func getTitle() : async Text {
        return title;
    };

    public shared func setTitle(t: Text) : async () {
        title := t;
    };

    public shared func addPoolHomework (homeworks: [Homework]) : async Result.Result<(), Text> {
        try {
            if (isAssignedHomework) {
                return #err("The tasks have already been assigned");
            };

            for (homework in homeworks.vals()) {
                poolHomeworkDiary.add(homework);
            };
        } catch (e) {
            return #err("Invalid values");
        };
        return #ok();
    };

    public shared func updateHomework (updateData: [UpdateHomework]) : async Result.Result<(), Text> {
        try {
            if (isAssignedHomework) {
                return #err("The tasks have already been assigned");
            };

            for (d in updateData.vals())  {
                poolHomeworkDiary.put(d.homeworkId, d.data);
            };
        } catch (e) {
            return #err("Invalid values");
        };
        return #ok();
    };

    public shared func deleteHomework (homeworkId: Nat) : async Result.Result<(), Text> {
        try {
            if (isAssignedHomework) {
                return #err("The tasks have already been assigned");
            };

            if (homeworkId >= poolHomeworkDiary.size()) {
                return #err("Invalid homeworkId");
            };

            let _ = poolHomeworkDiary.remove(homeworkId);

        } catch (e) {
            return #err("Invalid values");
        };
        return #ok();
    };

    public shared query func getPoolHomeHomework () : async [Homework] {
        return Buffer.toArray<Homework>(poolHomeworkDiary);
    };

    public shared query func getIsAssignedHomework () : async Bool {
        return isAssignedHomework;
    };

    public shared func addStudents (studentsData: [Student]) : async Result.Result<(), Text> {
        try {
            if (isAssignedHomework) {
                return #err("The tasks have already been assigned");
            };

            for (student in studentsData.vals()) {
                if (student.homeworkIds.size() != 0) {
                    return #err("Not allow to assign homework");
                };
                students.add(student);
            };
        } catch (e) {
            return #err("Invalid values");
        };
        return #ok();
    };

    public shared func deleteStudent (studentId: Nat) : async Result.Result<(), Text> {
        try {
            if (isAssignedHomework) {
                return #err("The tasks have already been assigned");
            };

            if (studentId >= students.size()) {
                return #err("Invalid studentId");
            };

            let _ = students.remove(studentId);

        } catch (e) {
            return #err("Invalid values");
        };
        return #ok();
    };

    public shared query func getStudents () : async [StudentHomework] {
        let studentsHomework = Buffer.Buffer<StudentHomework>(students.size());

        for (student in students.vals()) {
            
            let homeworks =  Buffer.Buffer<HomeworkWithId>(student.homeworkIds.size());
            for (homeworkId in student.homeworkIds.vals()) {
                let homework = poolHomeworkDiary.get(homeworkId);
                let homeworkWithId : HomeworkWithId = {
                    homeworkId;
                    title = homework.title;
                    description = homework.description;
                    dueDate = homework.dueDate;
                    weight = homework.weight;
                    completed = homework.completed;
                };
                
                homeworks.add(homeworkWithId);
            };
            
            let studentHomerWork : StudentHomework  = {
                name = student.name;
                homeworks = Buffer.toArray<HomeworkWithId>(homeworks);
            };

            studentsHomework.add(studentHomerWork);
        };

        return Buffer.toArray<StudentHomework>(studentsHomework);
    };

    public shared func assignHomework() : async Result.Result<(), Text> {
        let totalStudents = students.size();
        let totalHomeworks = poolHomeworkDiary.size();
        
        if (isAssignedHomework) {
            return #err("The tasks have already been assigned");
        };

        if (totalStudents == 0){
            return #err("No students to assign");
        };

        if (totalHomeworks == 0){
            return #err("No homework to assign");
        };

        // Process for group homework
        let groupHomeworks = Buffer.Buffer<GroupHomework>(0);
        var averageWeight : Float = 0;
        if (totalStudents < totalHomeworks) {
            
            let mapperHomework = Buffer.Buffer<MapperHomework>(0);
            
            var homeworkId = 0;
            for (hw in poolHomeworkDiary.vals()) {
                averageWeight += Float.fromInt(hw.weight);
                
                mapperHomework.add({
                    homeworkId;
                    weight = hw.weight;
                });         
                
                homeworkId += 1;
            };
            averageWeight := averageWeight / Float.fromInt(totalHomeworks);

            let deleteMapperHomeworkIds = Buffer.Buffer<Nat>(0);
            var mapperHomeworkId : Nat = 0;

            // group homework greater than averageWeight
            for (mhw in mapperHomework.vals()) {
                if (averageWeight <= Float.fromInt(mhw.weight)) {
                    let groupHw : GroupHomework = {
                        homeworkIds = [mhw.homeworkId];
                        totalWeight = mhw.weight;
                    };
                    groupHomeworks.add(groupHw);
                    deleteMapperHomeworkIds.add(mapperHomeworkId);
                };
                mapperHomeworkId += 1;
            };

            // delete homeworkids grouped from mapper
            deleteMapperHomeworkIds.sort(Nat.compare);
            Buffer.reverse(deleteMapperHomeworkIds);
            for (homeworkId in deleteMapperHomeworkIds.vals()) {
                let _ = mapperHomework.remove(homeworkId);
            };
            deleteMapperHomeworkIds.clear();

            // complete quantity of groups for homeworks
            while (groupHomeworks.size() < totalStudents) {
                let mapperHomeworkId = 0;
                let mhw = mapperHomework.get(mapperHomeworkId);
                let groupHw : GroupHomework = {
                    homeworkIds = [mhw.homeworkId];
                    totalWeight = mhw.weight;
                };
                groupHomeworks.add(groupHw);
                let _ = mapperHomework.remove(mapperHomeworkId);
            };
            
            var flagMapper = true;
            while (mapperHomework.size() != 0 and flagMapper) {
                let minGroupHomework = Buffer.min(groupHomeworks, _compareGroupHomeworks);
                
                switch (minGroupHomework) {
                    case null {
                        flagMapper := false;
                    };
                    case (?gh) {
                        let indexGroupHomework = Buffer.indexOf<GroupHomework>(gh, groupHomeworks, _equalGroupHomeworks);
                        
                        switch (indexGroupHomework) {
                            case null {
                                flagMapper := false;
                            };
                            case (?index) {
                                let mapperHomeworkId = 0;
                                let mhw = mapperHomework.get(mapperHomeworkId);
                                let groupHw : GroupHomework = {
                                    homeworkIds = Array.append<Nat>(gh.homeworkIds, [mhw.homeworkId]);
                                    totalWeight = mhw.weight + gh.totalWeight;
                                };
                                groupHomeworks.put(index, groupHw);
                                let _ = mapperHomework.remove(mapperHomeworkId);
                            };
                        };
                    };
                };
            };

        } else {
            var homeworkId : Nat = 0;
            for (hw in poolHomeworkDiary.vals()) {
                averageWeight += Float.fromInt(hw.weight);
                
                let groupHw : GroupHomework = {
                    homeworkIds = [homeworkId];
                    totalWeight = hw.weight;
                };
                groupHomeworks.add(groupHw);

                homeworkId += 1;
            };
            averageWeight := averageWeight / Float.fromInt(totalHomeworks);
        };

        // Start random group homework
        let seed = await Random.blob();

        var studentId = 0;
        for (student in students.vals()) {
            let randomId = Random.binomialFrom(Nat8.fromNat(groupHomeworks.size()) - 1, seed);
            let groupHw = groupHomeworks.get(Nat8.toNat(randomId));
            let updateStudent : Student = {
                name = student.name;
                totalWeight = groupHw.totalWeight;
                homeworkIds = groupHw.homeworkIds;
            };
            students.put(studentId, updateStudent);

            let _ = groupHomeworks.remove(Nat8.toNat(randomId));
            studentId += 1;
        };

        isAssignedHomework := true;

        return #ok();
    };

    func _compareGroupHomeworks(x : GroupHomework, y : GroupHomework) : { #less; #equal; #greater } {
        if (x.totalWeight < y.totalWeight) { #less } else if (x.totalWeight == y.totalWeight) { #equal } else { #greater }
    };

    func _equalGroupHomeworks(x : GroupHomework, y : GroupHomework) : Bool {
        return x == y;
    };

    public shared func markHomeworkAsCompleted(homeworkId: Nat, isCompleted: Bool) : async Result.Result<(), Text> {
        if (not isAssignedHomework) {
            return #err("The tasks have already been assigned");
        };

        let lastId : Nat = poolHomeworkDiary.size() - 1;
        if (homeworkId > lastId) {
            return #err("Invalid id");
        };

        let homework = poolHomeworkDiary.get(homeworkId);

        let updateHomework : Homework = {
            title = homework.title;
            description = homework.description;
            dueDate = homework.dueDate;
            weight = homework.weight;
            completed = isCompleted;
        };
        poolHomeworkDiary.put(homeworkId, updateHomework);

        return #ok();
    };

    public shared func resetHomework() : async () {
        isAssignedHomework := false;
        poolHomeworkDiary.clear();
        students.clear();
        title := "MOTOKO BOOTCAMP 2023 HOMEWORK DIARY";
    };
}