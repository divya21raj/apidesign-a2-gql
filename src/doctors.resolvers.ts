
import { Query, Resolver, Mutation, Arg } from "type-graphql"
import { Appointment, AppointmentDeleteInput, AppointmentInput, Doctor, DoctorInput } from "./doctors.schema"

@Resolver(() => Doctor)
export class DoctorsResolver {
    private MIN_SLOT = 0
    private MAX_SLOT = 15
    private all_slots_list = Array.from(Array(this.MAX_SLOT + 1).keys())
    private doctorList: Doctor[] = [
        { doctor_id: 1, doctor_name: "Stephen Strange", speciality: "Mystic Arts", clinic: "Sanctum Sanctorum", slots_available: [0, 1, 3, 9, 15], appointments:[] },
        { doctor_id: 2, doctor_name: "Bruce Banner", speciality: "Anger Management", clinic: "Dayton", slots_available: this.all_slots_list, appointments:[] },
        { doctor_id: 3, doctor_name: "Jane Foster", speciality: "Cancer Treatment", clinic: "New Asgard", slots_available:  [1, 13, 4, 11], appointments:[]},
        { doctor_id: 4, doctor_name: "Reed Richards", speciality: "Muscle Elasticity", clinic: "Baxter Building", slots_available: [10, 11, 13, 1, 8], appointments:[]},
    ]

    @Query(() => [Doctor])
    async doctors(): Promise<Doctor[]> {
        return this.doctorList
    }

    @Query(() => [Appointment])
    async appointments(): Promise<Appointment[]> {
        return this.getAppointments()
    }

    @Query(() => [Appointment])
    async appointmentsByPatientName(@Arg("patient_name") patient_name: string): Promise<Appointment[] | undefined> {
        return this.getAppointments().filter(a => a.patient_name === patient_name)
    }

    @Query(() => Doctor)
    async doctorById(@Arg("id") id: number): Promise<Doctor | undefined> {
        const doctor = this.doctorList.find(u => u.doctor_id === id)
        if (!doctor) 
            throw new Error(`Doctor with ID - ${id} not found`);
        return doctor
    }

    @Mutation(() => Doctor)
    async createDoctor(@Arg("input") input: DoctorInput): Promise<Doctor> {
        const doctor = {
            doctor_id: this.doctorList.length + 1,
            ...input,
            slots_available: [],
            appointments: []
        }
        
        this.doctorList.push(doctor)
        return doctor
    }

    @Mutation(() => Appointment)
    async createAppointment(@Arg("input") input: AppointmentInput): Promise<Appointment> {
        const doctor = this.doctorList.find(doctor => doctor.doctor_id === input.doctor_id)
        
        if (!doctor) 
            throw new Error(`Doctor with ID - ${input.doctor_id} not found`);
        if (input.slot < this.MIN_SLOT || input.slot > this.MAX_SLOT) 
            throw new Error(`Slot ${input.slot} is invalid`);
        if (!doctor.slots_available.includes(input.slot))
            throw new Error(`Slot ${input.slot} is unavailable`);

        doctor.slots_available = doctor.slots_available.filter(slot => slot !== input.slot)
        
        const appointment: Appointment = {
            appointment_id: this.getNewAppointId(),
            ...input,
        }
        
        doctor.appointments.push(appointment)
        return appointment
    }

    @Mutation(() => Number)
    async deleteAppointment(@Arg("input") input: AppointmentDeleteInput) {
        const doctor = this.doctorList.find(doctor => doctor.doctor_id === input.doctor_id)
        
        if (!doctor) 
            throw new Error(`Doctor with ID - ${input.doctor_id} not found`)
        if (!doctor.appointments.find(a => a.slot === input.slot))
            throw new Error(`Slot ${input.slot} is not valid`)

        doctor.slots_available = [input.slot, ...doctor.slots_available]
        doctor.appointments = doctor.appointments.filter(a => a.slot !== input.slot)
        return input.slot
    }

    @Mutation(() => Appointment)
    async updatePatientNameOnAppointment(@Arg("input") input: AppointmentInput): Promise<Appointment> {   
        const doctor = this.doctorList.find(doctor => doctor.doctor_id === input.doctor_id)     
        
        if (!doctor) 
            throw new Error(`Doctor with ID - ${input.doctor_id} not found`)
        
        const appointmentIndex = doctor.appointments.findIndex(a => a.slot === input.slot)

        if (appointmentIndex === -1) 
            throw new Error(`Appointment with slot - ${input.slot} not found`);

        doctor.appointments[appointmentIndex] = {
            ...doctor.appointments[appointmentIndex],
            patient_name: input.patient_name
        }
        
        return doctor.appointments[appointmentIndex]
    }

    getAppointments = (): Appointment[] => this.doctorList.flatMap(doctor => doctor.appointments)

    getNewAppointId = () => this.getAppointments().length + 1
}