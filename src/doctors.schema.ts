import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class Doctor {
    @Field()
    doctor_id!: number
    @Field()
    doctor_name!: string
    @Field()
    speciality!: string
    @Field()
    clinic!: string
    @Field(() => [Number])
    slots_available!: number[]
    @Field(() => [Appointment])
    appointments!: Appointment[]
}

@ObjectType()
export class Appointment {
    @Field()
    appointment_id!: number
    @Field()
    slot!: number
    @Field()
    doctor_id!: number
    @Field()
    patient_name!: string
}

@InputType()
export class DoctorInput implements Pick<Doctor, "doctor_name" | "speciality"| "clinic"> {
    @Field()
    doctor_name!: string
    @Field()
    speciality!:string
    @Field()
    clinic!: string
}

@InputType()
export class AppointmentInput implements Pick<Appointment, "doctor_id" | "patient_name" | "slot"> {
    @Field()
    doctor_id!: number
    @Field()
    patient_name!: string
    @Field()
    slot!: number
}

@InputType()
export class AppointmentDeleteInput implements Pick<Appointment, "doctor_id" | "slot"> {
    @Field()
    doctor_id!: number
    @Field()
    slot!: number
}